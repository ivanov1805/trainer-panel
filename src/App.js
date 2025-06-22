import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    date: "",
    type: "игровая",
    plan: "",
    paid: "",
    cost: "",
    attended: false,
    afterComment: "",
    comment: "",
  });
  const [filterName, setFilterName] = useState("");

  const handleAdd = () => {
    const balance = parseFloat(form.paid || 0) - parseFloat(form.cost || 0);
    setSessions([...sessions, { ...form, balance: balance.toFixed(2) }]);
    setForm({
      name: "",
      date: "",
      type: "игровая",
      plan: "",
      paid: "",
      cost: "",
      attended: false,
      afterComment: "",
      comment: "",
    });
  };

  const filteredSessions = filterName
    ? sessions.filter(s => s.name.toLowerCase().includes(filterName.toLowerCase()))
    : sessions;

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(sessions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Тренировки");
    XLSX.writeFile(wb, "тренировки.xlsx");
  };

  const weeklyStats = sessions.reduce((acc, s) => {
    if (!s.date || !s.paid) return acc;
    const week = new Date(s.date);
    week.setDate(week.getDate() - week.getDay());
    const key = week.toISOString().split("T")[0];
    acc[key] = (acc[key] || 0) + parseFloat(s.paid);
    return acc;
  }, {});

  const chartData = Object.entries(weeklyStats).map(([week, total]) => ({ week, total }));

  return (
    <div style={{ padding: 20 }}>
      <h2>Тренерская панель</h2>
      <div>
        <input placeholder="Имя ученика" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
          <option value="игровая">Игровая</option>
          <option value="персональная">Персональная</option>
        </select>
        <textarea placeholder="План на тренировку" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} />
        <input placeholder="Оплата (₽)" type="number" value={form.paid} onChange={e => setForm({ ...form, paid: e.target.value })} />
        <input placeholder="Стоимость (₽)" type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
        <select value={form.attended ? "да" : "нет"} onChange={e => setForm({ ...form, attended: e.target.value === "да" })}>
          <option value="да">Присутствовал</option>
          <option value="нет">Не пришёл</option>
        </select>
        <textarea placeholder="Комментарий после тренировки" value={form.afterComment} onChange={e => setForm({ ...form, afterComment: e.target.value })} />
        <textarea placeholder="Доп. комментарий" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
        <button onClick={handleAdd}>Добавить тренировку</button>
      </div>
      <div>
        <input placeholder="Фильтр по имени" value={filterName} onChange={e => setFilterName(e.target.value)} />
        <button onClick={handleExport}>Экспорт в Excel</button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <div>
        {filteredSessions.map((s, i) => (
          <div key={i} style={{ border: '1px solid #ccc', margin: '10px 0', padding: 10 }}>
            <div><strong>{s.name}</strong> — {s.date} ({s.type})</div>
            <div>План: {s.plan}</div>
            <div>Оплата: {s.paid}₽ | Стоимость: {s.cost}₽ | Баланс: {s.balance}₽</div>
            <div>Был: {s.attended ? "Да" : "Нет"}</div>
            <div>Комментарий: {s.afterComment}</div>
            <div>Дополнительно: {s.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
