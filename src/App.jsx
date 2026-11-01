import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Analytics from './components/Analytics';
import { 
  Bell, Wrench, BookOpen, Users, Building2, HelpCircle, 
  Plus, BarChart2, X, ChevronDown, ChevronRight, FolderPlus, Trash2 
} from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import KanbanBoard from './components/KanbanBoard';
import { CreateTaskModal, TaskDetailsModal } from './components/TaskModal';
import './App.css';

const defaultObjectsTree = [
  { id: '1', name: 'Tervise 17, Sillamäe', children: [] },
  { id: '2', name: 'Sepa põik 1, Narva', children: [] },
  { id: '3', name: 'Tervise 10, Sillamäe', children: [] },
  { id: '4', name: 'Tervise 11, Sillamäe', children: [] },
  { id: '5', name: 'Tervise 12, Sillamäe', children: [] }
];

export default function App() {
  const [currentView, setCurrentView] = useState('tood');
  const [isObjectsOpen, setIsObjectsOpen] = useState(true);
  const [objectsTree, setObjectsTree] = useLocalStorage('app_objects_tree', defaultObjectsTree);
  const [tasks, setTasks] = useLocalStorage('app_tasks', []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Analüütika');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({ '1': true });

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleCreateTask = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddChild = (parentId = null) => {
    const name = prompt('Введите название объекта/помещения:');
    if (!name) return;

    const newNode = { id: Date.now().toString(), name, children: [] };
    if (!parentId) {
      setObjectsTree([...objectsTree, newNode]);
      return;
    }

    const addRecursively = (nodes) => nodes.map(node => {
      if (node.id === parentId) return { ...node, children: [...(node.children || []), newNode] };
      if (node.children) return { ...node, children: addRecursively(node.children) };
      return node;
    });

    setObjectsTree(addRecursively(objectsTree));
    setExpandedNodes(prev => ({ ...prev, [parentId]: true }));
  };

  const handleDeleteNode = (id) => {
    if (!window.confirm('Удалить объект?')) return;
    const deleteRecursively = (nodes) => nodes
      .filter(n => n.id !== id)
      .map(n => ({ ...n, children: n.children ? deleteRecursively(n.children) : [] }));
    setObjectsTree(deleteRecursively(objectsTree));
  };

  const flattenObjects = (nodes, prefix = '') => {
    let list = [];
    nodes.forEach(node => {
      const fullName = prefix ? `${prefix} > ${node.name}` : node.name;
      list.push({ id: node.id, name: fullName });
      if (node.children?.length) {
        list = list.concat(flattenObjects(node.children, fullName));
      }
    });
    return list;
  };

  // Функция обработки загрузки Excel файла
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        // Маппим строки Excel в задачи нашей структуры
        const importedTasks = rawData.map((row) => {
          const statusStr = String(row['Status'] || '').trim().toLowerCase();
          let mappedStatus = 'Sissetulnud';
          if (statusStr.includes('done') || statusStr.includes('tehtud')) {
            mappedStatus = 'Tehtud tööd';
          } else if (statusStr.includes('progress') || statusStr.includes('töös')) {
            mappedStatus = 'Töös';
          }

          // Умное определение типа проблемы по заголовку
          const title = String(row['Task title'] || 'Заявка');
          let problemType = 'Конструктивные части';
          const lower = title.toLowerCase();
          if (lower.includes('veeleke') || lower.includes('lekib') || lower.includes('valamu')) problemType = 'Сантехника';
          else if (lower.includes('silikoon') || lower.includes('köögis')) problemType = 'Внутренняя отделка';
          else if (lower.includes('uks') || lower.includes('lukk')) problemType = 'Замки / ручки дверные';
          else if (lower.includes('kapi') || lower.includes('mööbel')) problemType = 'Мебель';
          else if (lower.includes('elektr')) problemType = 'Электрика';

          // Преобразование даты из формата DD.MM.YYYY в ISO
          let isoDate = new Date().toISOString();
          const dateStr = String(row['Created date'] || '');
          if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) {
              isoDate = `${parts[2]}-${parts[1]}-${parts[0]}T08:00:00.000Z`;
            }
          }

          return {
            id: String(row['Task nr'] || Math.floor(10000 + Math.random() * 90000)),
            title: title,
            location: String(row['Building'] || 'Sinimäe Kodu'),
            room: row['Room'] ? String(row['Room']) : '',
            description: String(row['Task description'] || ''),
            problemType: problemType,
            assignee: row['Supervisor'] ? String(row['Supervisor']) : 'Михаил Лямин',
            author: 'ML',
            authorFullName: 'Михаил Лямин',
            status: mappedStatus,
            createdAt: isoDate
          };
        });

        setTasks(importedTasks);
        alert(`Успешно загружено заявок: ${importedTasks.length}`);
      } catch (err) {
        console.error(err);
        alert('Ошибка при чтении файла Excel.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const renderTree = (nodes, level = 0) => {
    return nodes.map(node => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes[node.id];
      return (
        <div key={node.id} className="tree-node" style={{ paddingLeft: `${level * 16}px` }}>
          <div className="tree-node-content">
            <button className="tree-toggle-btn" onClick={() => toggleNode(node.id)}>
              {hasChildren ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="tree-dot">•</span>}
            </button>
            <span className="tree-node-name">{node.name}</span>
            <div className="tree-node-actions">
              <button title="Добавить" onClick={() => handleAddChild(node.id)}><FolderPlus size={14} /></button>
              <button title="Удалить" onClick={() => handleDeleteNode(node.id)} className="delete-btn"><Trash2 size={14} /></button>
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div className="tree-children">{renderTree(node.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  const filteredTasks = tasks.filter(task => {
    const q = searchQuery.toLowerCase();
    return task.title.toLowerCase().includes(q) || task.location.toLowerCase().includes(q) || task.id.includes(q);
  });

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo"><span className="logo-icon">A</span></div>
        <nav className="sidebar-nav">
          <button className="nav-item"><Bell size={18} /><span>Teavitused</span><span className="badge">99+</span></button>
          <div className="nav-section-title">ÜLDINE</div>
          <button className={`nav-item ${currentView === 'tood' ? 'active' : ''}`} onClick={() => setCurrentView('tood')}>
            <Wrench size={18} /><span>Tööd</span>
          </button>
          <button className="nav-item"><BookOpen size={18} /><span>Hoolduspäevik</span></button>
          <div className="nav-section-title">HALDUS</div>
          <button className="nav-item"><Users size={18} /><span>Kontaktihaldus</span></button>

          <div className="dropdown-nav-group">
            <button className={`nav-item ${currentView === 'objektid' ? 'active' : ''}`} onClick={() => { setIsObjectsOpen(!isObjectsOpen); setCurrentView('objektid'); }}>
              <Building2 size={18} /><span>Objektid</span>
              <span className="chevron-icon">{isObjectsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
            </button>
            {isObjectsOpen && (
              <div className="sidebar-tree-container">
                <div className="tree-header">
                  <span>Дерево объектов</span>
                  <button onClick={() => handleAddChild(null)} title="Добавить объект"><Plus size={14} /></button>
                </div>
                {renderTree(objectsTree)}
              </div>
            )}
          </div>
        </nav>
        <div className="sidebar-footer"><button className="nav-item"><HelpCircle size={18} /><span>Abi</span></button></div>
      </aside>

      <main className="main-content">
        {currentView === 'objektid' ? (
          <div className="objects-manager-page">
            <header className="page-header">
              <h2>Управление объектами и помещениями</h2>
              <button className="btn-primary" onClick={() => handleAddChild(null)}><Plus size={16} /> Добавить главный объект</button>
            </header>
            <div className="full-tree-view">{renderTree(objectsTree)}</div>
          </div>
        ) : activeTab === 'Analüütika' ? (
          <>
            <header className="top-header">
              <div className="header-tabs">
                <button className="tab-btn active" onClick={() => setActiveTab('Tööd')} style={{ fontWeight: '600', color: '#2563eb' }}>
                  ← Назад к заявкам
                </button>
              </div>
              <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}>
                  📁 Laadi Excel
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus size={16} /> Lisa töö
                </button>
              </div>
            </header>
            <Analytics tasks={tasks} />
          </>
        ) : (
          <>
            <header className="top-header">
              <div className="header-tabs">
                <button className="tab-btn" onClick={() => setActiveTab('Analüütika')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BarChart2 size={16} className="tab-icon" /> Analüütika
                </button>
              </div>
              <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}>
                  📁 Laadi Excel
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus size={16} /> Lisa töö
                </button>
              </div>
            </header>

            <div className="filter-bar">
              <div className="search-box">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Otsi..." />
                {searchQuery && <button className="clear-search" onClick={() => setSearchQuery('')}><X size={14} /></button>}
              </div>
            </div>

            <KanbanBoard 
              tasks={filteredTasks} 
              onStatusChange={handleStatusChange} 
              onOpenDetails={setSelectedTask} 
            />
          </>
        )}

        <CreateTaskModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onCreate={handleCreateTask} 
          availableLocations={flattenObjects(objectsTree)} 
        />

        <TaskDetailsModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      </main>
    </div>
  );
}