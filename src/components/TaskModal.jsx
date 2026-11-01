import React, { useState } from 'react';
import { X } from 'lucide-react';

const problemTypes = [
  'Двери', 'Окна', 'Электрика', 'Отопление', 'Мебель', 
  'Сантехника', 'Трубопровод', 'Освещение', 'Бытовые товары', 
  'Уборка территории', 'Конструктивные части', 'Внутренняя отделка', 
  'Бытовые машины', 'Замки / ручки дверные'
];

const assigneesList = ['Михаил Лямин'];

export function CreateTaskModal({ isOpen, onClose, onCreate, availableLocations }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [problemType, setProblemType] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('Sissetulnud');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !location || !problemType || !assignee) {
      alert('Заполните обязательные поля!');
      return;
    }

    onCreate({
      id: Math.floor(10000 + Math.random() * 90000).toString(),
      title,
      location,
      room,
      description,
      problemType,
      assignee,
      author: 'ML',
      authorFullName: 'Михаил Лямин',
      status,
      createdAt: new Date().toISOString() // <-- Добавлена точная дата для работы аналитики
    });

    setTitle('');
    setLocation('');
    setRoom('');
    setDescription('');
    setProblemType('');
    setAssignee('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Uue töö lisamine</h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Название задачи *</label>
            <input 
              type="text" 
              required 
              placeholder="Например: Замена смесителя"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Объект из дерева (Objekt) *</label>
            <select required value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">-- Выберите объект --</option>
              {availableLocations.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Помещение / Комната (Ruum)</label>
            <input 
              type="text" 
              placeholder="Например: Elutuba / Каб. 101"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Описание работы</label>
            <textarea 
              rows="3"
              placeholder="Подробное описание..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Тип проблемы *</label>
            <select required value={problemType} onChange={(e) => setProblemType(e.target.value)}>
              <option value="">-- Выберите тип проблемы --</option>
              {problemTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Ответственный *</label>
            <select required value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">-- Выберите ответственного --</option>
              {assigneesList.map(person => <option key={person} value={person}>{person}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Кто создал заявку</label>
            <input type="text" disabled value="Михаил Лямин" style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} />
          </div>

          <div className="form-group">
            <label>Начальный статус</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Sissetulnud">Sissetulnud</option>
              <option value="Töös">Töös</option>
              <option value="Tehtud tööd">Tehtud tööd</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn-primary">Создать заявку</button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export function TaskDetailsModal({ task, onClose, onSendMessage }) {
  const [messageText, setMessageText] = useState('');

  if (!task) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    if (onSendMessage) {
      onSendMessage(task.id, messageText);
    }

    alert(`Сообщение отправлено автору (${task.authorFullName || 'Автору'}): "${messageText}"`);
    setMessageText('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Заявка #{task.id}</h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-form" style={{ gap: '12px' }}>
          <div><strong>Название:</strong> {task.title}</div>
          <div><strong>Объект:</strong> {task.location}</div>
          {task.room && <div><strong>Помещение:</strong> {task.room}</div>}
          <div><strong>Тип проблемы:</strong> {task.problemType}</div>
          <div><strong>Описание:</strong> {task.description || 'Нет описания'}</div>
          <div><strong>Ответственный:</strong> {task.assignee}</div>
          <div><strong>Кто создал:</strong> {task.authorFullName}</div>
          <div><strong>Статус:</strong> {task.status}</div>
          {task.createdAt && <div><strong>Дата создания:</strong> {new Date(task.createdAt).toLocaleDateString()}</div>}

          {/* Форма отправки сообщения автору */}
          <form onSubmit={handleSend} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '8px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              💬 Отправить сообщение автору:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={messageText} 
                onChange={(e) => setMessageText(e.target.value)} 
                placeholder="Напишите сообщение..." 
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
              />
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={14} /> Отправить
              </button>
            </div>
          </form>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-primary" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
}