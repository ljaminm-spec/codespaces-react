import React, { useState } from 'react';
import { BarChart2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function Analytics({ tasks }) {
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year', 'all'

  // Фильтрация по периоду (привязка к дате создания или выполнения, если даты нет — берем все)
  const filterByPeriod = (task) => {
    if (period === 'all') return true;
    // Если у задачи нет даты, для примера считаем текущим днем, либо можно добавить поле даты при создании
    const taskDate = task.createdAt ? new Date(task.createdAt) : new Date();
    const now = new Date();
    const diffTime = now - taskDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (period === 'week') return diffDays <= 7;
    if (period === 'month') return diffDays <= 30;
    if (period === 'year') return diffDays <= 365;
    return true;
  };

  const filteredTasks = tasks.filter(filterByPeriod);

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'Tehtud tööd').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'Töös').length;
  const incomingTasks = filteredTasks.filter(t => t.status === 'Sissetulnud').length;

  // Группировка выполненных работ по типам проблем за выбранный период
  const completedByType = filteredTasks
    .filter(t => t.status === 'Tehtud tööd')
    .reduce((acc, task) => {
      const type = task.problemType || 'Другое';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

  return (
    <div className="analytics-container" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart2 size={24} style={{ color: '#3b82f6' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>Аналитика выполненных работ</h2>
        </div>

        {/* Переключатель периода */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
          <button 
            onClick={() => setPeriod('week')} 
            style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', border: 'none', background: period === 'week' ? '#fff' : 'transparent', borderRadius: '6px', cursor: 'pointer', boxShadow: period === 'week' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
            Неделя
          </button>
          <button 
            onClick={() => setPeriod('month')} 
            style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', border: 'none', background: period === 'month' ? '#fff' : 'transparent', borderRadius: '6px', cursor: 'pointer', boxShadow: period === 'month' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
            Месяц
          </button>
          <button 
            onClick={() => setPeriod('year')} 
            style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', border: 'none', background: period === 'year' ? '#fff' : 'transparent', borderRadius: '6px', cursor: 'pointer', boxShadow: period === 'year' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
            Год
          </button>
          <button 
            onClick={() => setPeriod('all')} 
            style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', border: 'none', background: period === 'all' ? '#fff' : 'transparent', borderRadius: '6px', cursor: 'pointer', boxShadow: period === 'all' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
            Все
          </button>
        </div>
      </div>

      {/* Карточки со статистикой */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>
            <AlertCircle size={16} style={{ color: '#f59e0b' }} /> Sissetulnud
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{incomingTasks}</div>
        </div>

        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>
            <Clock size={16} style={{ color: '#3b82f6' }} /> Töös
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{inProgressTasks}</div>
        </div>

        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>
            <CheckCircle2 size={16} style={{ color: '#22c55e' }} /> Tehtud tööd
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{completedTasks}</div>
        </div>
      </div>

      {/* График / Срез выполненных работ по типам */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
          Выполненные работы по типам за выбранный период
        </h3>
        {Object.keys(completedByType).length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '14px' }}>За выбранный период выполненных работ нет.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(completedByType).map(([type, count]) => {
              const maxCount = Math.max(...Object.values(completedByType));
              const percentage = (count / maxCount) * 100;

              return (
                <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{type}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{count} {count === 1 ? 'работа' : 'работ'}</span>
                  </div>
                  {/* Прогресс-бар имитирующий график */}
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: '#3b82f6', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}