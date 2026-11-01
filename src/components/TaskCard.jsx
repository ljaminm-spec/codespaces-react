import React from 'react';
import { Home, DoorOpen, Maximize2 } from 'lucide-react';

const columns = [
  { key: 'Sissetulnud', label: 'Sissetulnud' },
  { key: 'Töös', label: 'Töös' },
  { key: 'Tehtud tööd', label: 'Tehtud tööd' }
];

export default function TaskCard({ task, onStatusChange, onOpenDetails }) {
  return (
    <div className="task-card">
      <div className="card-header">
        <h4 className="task-title">{task.title}</h4>
        <button className="expand-btn" onClick={() => onOpenDetails(task)} title="Развернуть">
          <Maximize2 size={13} />
        </button>
      </div>

      <div className="card-location">
        <Home size={13} />
        <span>{task.location}</span>
      </div>

      {task.room && (
        <div className="card-room">
          <DoorOpen size={13} />
          <span>{task.room}</span>
        </div>
      )}

      <div className="card-footer">
        <span className="task-id">#{task.id}</span>
        <div className="card-footer-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="author-avatar" title={task.authorFullName}>
            {task.author}
          </span>
          <select 
            className="card-status-select"
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
          >
            {columns.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}