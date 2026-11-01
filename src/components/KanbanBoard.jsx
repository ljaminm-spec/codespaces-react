import React from 'react';
import TaskCard from './TaskCard';

const columns = [
  { key: 'Sissetulnud', label: 'Sissetulnud', color: '#f59e0b' },
  { key: 'Töös', label: 'Töös', color: '#3b82f6' },
  { key: 'Tehtud tööd', label: 'Tehtud tööd', color: '#22c55e' }
];

export default function KanbanBoard({ tasks, onStatusChange, onOpenDetails }) {
  return (
    <div className="kanban-board">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <div className="kanban-column" key={col.key}>
            <div className="column-header">
              <span className="col-dot" style={{ backgroundColor: col.color }}></span>
              <span className="col-title">{col.label}</span>
              <span className="col-count">{colTasks.length}</span>
            </div>

            <div className="column-body">
              {colTasks.length === 0 ? (
                <div className="empty-card">Tööd puuduvad</div>
              ) : (
                colTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onStatusChange={onStatusChange} 
                    onOpenDetails={onOpenDetails} 
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}