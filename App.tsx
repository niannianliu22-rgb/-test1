import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Task, Priority, TaskStatus, NavView } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<Priority, string> = {
  high: '#FF3B30',
  medium: '#FF9500',
  low: '#34C759',
};

const PRIORITY_BG: Record<Priority, string> = {
  high: '#FFF2F1',
  medium: '#FFF8F0',
  low: '#F0FFF4',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  high: '紧急',
  medium: '重要',
  low: '普通',
};

const TAG_COLORS: Record<string, string> = {
  设计: '#5856D6',
  会议: '#FF2D55',
  文档: '#32ADE6',
  开发: '#FF9500',
  其他: '#8E8E93',
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: '完成产品原型设计', priority: 'high',   status: 'in-progress', date: dateOffset(0), time: '09:00', tag: '设计' },
  { id: '2', title: '客户需求确认会议',   priority: 'high',   status: 'todo',        date: dateOffset(0), time: '11:00', tag: '会议' },
  { id: '3', title: '撰写项目周报',       priority: 'medium', status: 'todo',        date: dateOffset(0), time: '14:00', tag: '文档' },
  { id: '4', title: '代码 Review：用户模块', priority: 'medium', status: 'done',     date: dateOffset(0), time: '09:30', tag: '开发' },
  { id: '5', title: '回复设计反馈邮件',   priority: 'low',    status: 'todo',        date: dateOffset(0),               tag: '其他' },
  { id: '6', title: '更新技术文档',       priority: 'low',    status: 'todo',        date: dateOffset(1), time: '10:00', tag: '文档' },
  { id: '7', title: '部署测试环境',       priority: 'high',   status: 'todo',        date: dateOffset(1), time: '14:00', tag: '开发' },
  { id: '8', title: 'Q2 OKR 复盘会议',   priority: 'high',   status: 'todo',        date: dateOffset(2), time: '15:00', tag: '会议' },
  { id: '9', title: '整理设计素材库',     priority: 'low',    status: 'todo',        date: dateOffset(2),               tag: '设计' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = dateOffset(0);
  const tomorrow = dateOffset(1);
  if (dateStr === today) return '今天';
  if (dateStr === tomorrow) return '明天';
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 周${weekdays[d.getDay()]}`;
}

function groupByDate(tasks: Task[]): [string, Task[]][] {
  const map: Record<string, Task[]> = {};
  const sorted = [...tasks].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
  sorted.forEach(t => { (map[t.date] ??= []).push(t); });
  return Object.entries(map);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TrafficLights: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="flex items-center gap-2"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={onClose}
        className="w-3 h-3 rounded-full flex items-center justify-center transition-all hover:brightness-90"
        style={{ background: '#FF5F57', border: '0.5px solid #E0443E' }}
        title="关闭"
      >
        {hover && <span style={{ fontSize: 7, color: '#820005', fontWeight: 900, lineHeight: 1 }}>✕</span>}
      </button>
      <button
        className="w-3 h-3 rounded-full flex items-center justify-center transition-all hover:brightness-90"
        style={{ background: '#FEBC2E', border: '0.5px solid #D89D1C' }}
        title="最小化"
      >
        {hover && <span style={{ fontSize: 7, color: '#7A5200', fontWeight: 900, lineHeight: 1 }}>−</span>}
      </button>
      <button
        className="w-3 h-3 rounded-full flex items-center justify-center transition-all hover:brightness-90"
        style={{ background: '#28C840', border: '0.5px solid #1BA22E' }}
        title="全屏"
      >
        {hover && <span style={{ fontSize: 7, color: '#006600', fontWeight: 900, lineHeight: 1 }}>+</span>}
      </button>
    </div>
  );
};

const TaskRow: React.FC<{
  task: Task;
  showTime?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ task, showTime = true, onToggle, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const done = task.status === 'done';

  return (
    <div
      className={`group flex items-start gap-0 transition-opacity ${done ? 'opacity-45' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Time column */}
      {showTime && (
        <div className="w-14 flex-shrink-0 pt-3.5 pr-2 text-right">
          {task.time && (
            <span className="text-[11px] text-gray-400 font-medium tabular-nums">{task.time}</span>
          )}
        </div>
      )}

      {/* Dot + line */}
      <div className="flex flex-col items-center flex-shrink-0 mr-3">
        <div
          className="w-2.5 h-2.5 rounded-full mt-3.5 flex-shrink-0 z-10 ring-2 ring-white"
          style={{ background: done ? '#D1D5DB' : PRIORITY_COLOR[task.priority] }}
        />
        <div className="w-px flex-1 mt-1" style={{ background: '#E5E7EB' }} />
      </div>

      {/* Card */}
      <div className="flex-1 pb-3">
        <div
          className="flex items-start gap-2 px-3 py-2.5 rounded-xl transition-all"
          style={{ background: hovered && !done ? 'rgba(0,0,0,0.03)' : 'transparent' }}
        >
          <button
            onClick={() => onToggle(task.id)}
            className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
          >
            {done
              ? <CheckCircle2 size={17} style={{ color: '#34C759' }} fill="#34C759" />
              : <Circle size={17} style={{ color: PRIORITY_COLOR[task.priority] }} className="opacity-60" />
            }
          </button>

          <div className="flex-1 min-w-0">
            <p className={`text-[13px] font-medium leading-snug ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {task.title}
            </p>
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
              {task.tag && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                  style={{ color: TAG_COLORS[task.tag] ?? '#555', background: (TAG_COLORS[task.tag] ?? '#555') + '1A' }}
                >
                  {task.tag}
                </span>
              )}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                style={{ color: PRIORITY_COLOR[task.priority], background: PRIORITY_BG[task.priority] }}
              >
                {PRIORITY_LABEL[task.priority]}
              </span>
              {task.status === 'in-progress' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold text-blue-500 bg-blue-50">
                  进行中
                </span>
              )}
            </div>
          </div>

          {hovered && !done && (
            <button
              onClick={() => onDelete(task.id)}
              className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors mt-0.5"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AddTaskForm: React.FC<{
  defaultDate: string;
  onAdd: (task: Omit<Task, 'id'>) => void;
  onCancel: () => void;
}> = ({ defaultDate, onAdd, onCancel }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [time, setTime] = useState('');
  const [tag, setTag] = useState('其他');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), priority, status: 'todo', date: defaultDate, time: time || undefined, tag });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-4 mb-4 p-3.5 rounded-xl border"
      style={{ borderColor: '#BFDBFE', background: 'rgba(239,246,255,0.7)' }}
    >
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="新任务名称..."
        className="w-full text-[13px] font-medium text-gray-800 bg-transparent outline-none placeholder-gray-400 mb-3"
        onKeyDown={e => e.key === 'Escape' && onCancel()}
      />
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {(['high', 'medium', 'low'] as Priority[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              title={PRIORITY_LABEL[p]}
              className="w-3.5 h-3.5 rounded-full border-2 transition-all"
              style={{
                background: PRIORITY_COLOR[p],
                borderColor: PRIORITY_COLOR[p],
                transform: priority === p ? 'scale(1.3)' : 'scale(1)',
                opacity: priority === p ? 1 : 0.35,
              }}
            />
          ))}
        </div>

        <select
          value={tag}
          onChange={e => setTag(e.target.value)}
          className="text-[11px] text-gray-500 bg-transparent outline-none border-none cursor-pointer"
        >
          {Object.keys(TAG_COLORS).map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          className="text-[11px] text-gray-500 bg-transparent outline-none"
        />

        <div className="flex-1" />

        <button type="button" onClick={onCancel} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
          取消
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="text-[11px] px-2.5 py-1 bg-blue-500 text-white rounded-md disabled:opacity-40 hover:bg-blue-600 transition-colors font-semibold"
        >
          添加
        </button>
      </div>
    </form>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeView, setActiveView] = useState<NavView>('today');
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [visible, setVisible] = useState(true);

  const windowRef = useRef<HTMLDivElement>(null);
  const WIN_W = 720;
  const WIN_H = 560;

  // Center on mount
  useEffect(() => {
    setPos({
      x: Math.max(0, (window.innerWidth - WIN_W) / 2),
      y: Math.max(0, (window.innerHeight - WIN_H) / 2),
    });
  }, []);

  const handleTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!windowRef.current) return;
    const rect = windowRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true);
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - WIN_W, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - WIN_H, e.clientY - dragOffset.y)),
      });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging, dragOffset]);

  const toggleTask = (id: string) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t));

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const addTask = (data: Omit<Task, 'id'>) => {
    setTasks(prev => [...prev, { ...data, id: Date.now().toString() }]);
    setShowAddForm(false);
  };

  const today = dateOffset(0);

  const filteredTasks = (() => {
    switch (activeView) {
      case 'today': return tasks.filter(t => t.date === today);
      case 'upcoming': return tasks.filter(t => t.date > today);
      default: return tasks;
    }
  })();

  const todayPending = tasks.filter(t => t.date === today && t.status !== 'done').length;
  const allPending = tasks.filter(t => t.status !== 'done').length;
  const donePct = tasks.length ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0;

  const navItems: { id: NavView; label: string; icon: string; count: number }[] = [
    { id: 'today',    label: '今天',   icon: '☀️', count: todayPending },
    { id: 'upcoming', label: '即将到来', icon: '📅', count: tasks.filter(t => t.date > today && t.status !== 'done').length },
    { id: 'all',      label: '全部任务', icon: '📋', count: allPending },
  ];

  if (!visible) {
    return (
      <div
        className="fixed inset-0 flex items-end justify-center pb-12"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}
      >
        <button
          onClick={() => setVisible(true)}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-white border border-white/20 transition-all hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
        >
          打开任务窗口
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full blur-3xl opacity-30" style={{ width: 500, height: 500, top: '10%', left: '5%', background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute rounded-full blur-3xl opacity-20" style={{ width: 400, height: 400, bottom: '10%', right: '8%', background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="absolute rounded-full blur-3xl opacity-15" style={{ width: 300, height: 300, top: '50%', right: '30%', background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
      </div>

      {/* ── Floating Window ── */}
      <div
        ref={windowRef}
        className={`absolute rounded-2xl overflow-hidden flex flex-col ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{
          left: pos.x,
          top: pos.y,
          width: WIN_W,
          height: WIN_H,
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(48px) saturate(1.9)',
          WebkitBackdropFilter: 'blur(48px) saturate(1.9)',
          border: '1px solid rgba(255,255,255,0.55)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(0,0,0,0.12)',
          userSelect: 'none',
        }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center px-4 flex-shrink-0"
          style={{ height: 44, background: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(0,0,0,0.06)', cursor: 'grab' }}
          onMouseDown={handleTitleMouseDown}
        >
          <TrafficLights onClose={() => setVisible(false)} />
          <div className="flex-1 flex items-center justify-center gap-2 pointer-events-none">
            <span className="text-[13px] font-semibold text-gray-600 tracking-tight">任务时间线</span>
          </div>
          <div style={{ width: 52 }} />
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className="flex flex-col py-3 flex-shrink-0"
            style={{ width: 192, background: 'rgba(245,245,250,0.75)', borderRight: '1px solid rgba(0,0,0,0.06)' }}
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 mb-1.5">视图</p>

            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 mx-2 px-3 py-2 rounded-xl text-left transition-all text-[13px] font-medium ${
                  activeView === item.id
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:bg-white/60 hover:text-gray-700'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.count > 0 && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center"
                    style={activeView === item.id ? { background: '#3B82F6', color: '#fff' } : { background: '#E5E7EB', color: '#6B7280' }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            ))}

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 mt-4 mb-1.5">标签</p>

            {Object.entries(TAG_COLORS).map(([tag, color]) => (
              <button
                key={tag}
                className="flex items-center gap-2 mx-2 px-3 py-1.5 rounded-xl text-[12px] text-gray-500 hover:bg-white/60 hover:text-gray-700 transition-all"
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                {tag}
              </button>
            ))}

            <div className="flex-1" />

            {/* Progress Card */}
            <div className="mx-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-xl font-bold text-gray-800">{tasks.filter(t => t.status === 'done').length}</span>
                <span className="text-xs text-gray-400">/ {tasks.length} 已完成</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${donePct}%`, background: 'linear-gradient(90deg, #34C759, #30D158)' }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{donePct}% 完成率</p>
            </div>
          </div>

          {/* Main Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div
              className="flex items-center justify-between px-5 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.4)' }}
            >
              <div>
                <h2 className="text-[15px] font-bold text-gray-800">
                  {activeView === 'today' ? '今天' : activeView === 'upcoming' ? '即将到来' : '全部任务'}
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {activeView === 'today'
                    ? new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })
                    : `${filteredTasks.filter(t => t.status !== 'done').length} 项待完成`
                  }
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-all active:scale-95"
                style={{ background: '#3B82F6', boxShadow: '0 2px 8px rgba(59,130,246,0.35)' }}
              >
                <Plus size={13} strokeWidth={2.5} />
                添加任务
              </button>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto py-3 no-scrollbar">
              {showAddForm && (
                <AddTaskForm
                  defaultDate={today}
                  onAdd={addTask}
                  onCancel={() => setShowAddForm(false)}
                />
              )}

              {activeView === 'today' ? (
                // ── Timeline for Today ──
                <div className="px-4">
                  {filteredTasks.length === 0 && !showAddForm ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <span className="text-5xl">🎉</span>
                      <p className="text-[14px] font-semibold text-gray-600">今日任务全部完成！</p>
                      <p className="text-[12px] text-gray-400">享受美好时光吧</p>
                    </div>
                  ) : (
                    <>
                      {/* Pending tasks */}
                      {filteredTasks
                        .filter(t => t.status !== 'done')
                        .sort((a, b) => (!a.time ? 1 : !b.time ? -1 : a.time.localeCompare(b.time)))
                        .map(task => (
                          <TaskRow key={task.id} task={task} showTime onToggle={toggleTask} onDelete={deleteTask} />
                        ))
                      }

                      {/* Divider */}
                      {filteredTasks.some(t => t.status === 'done') && filteredTasks.some(t => t.status !== 'done') && (
                        <div className="flex items-center gap-3 my-3 px-2">
                          <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">已完成</span>
                          <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
                        </div>
                      )}

                      {/* Done tasks */}
                      {filteredTasks
                        .filter(t => t.status === 'done')
                        .map(task => (
                          <TaskRow key={task.id} task={task} showTime onToggle={toggleTask} onDelete={deleteTask} />
                        ))
                      }
                    </>
                  )}
                </div>
              ) : (
                // ── Grouped by Date ──
                <div>
                  {groupByDate(filteredTasks).map(([date, dateTasks]) => (
                    <div key={date}>
                      <div
                        className="sticky top-0 px-5 py-2 z-10"
                        style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)' }}
                      >
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{formatDisplayDate(date)}</span>
                      </div>
                      <div className="px-4">
                        {dateTasks.map(task => (
                          <TaskRow key={task.id} task={task} showTime onToggle={toggleTask} onDelete={deleteTask} />
                        ))}
                      </div>
                    </div>
                  ))}

                  {filteredTasks.length === 0 && !showAddForm && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <span className="text-5xl">📭</span>
                      <p className="text-[14px] font-semibold text-gray-600">暂无任务</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
