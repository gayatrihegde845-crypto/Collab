import { useState, FormEvent } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Users, 
  FileText, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  X, 
  Plus, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';

// --- Types ---

interface Task {
  id: number;
  title: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done' | 'Overdue';
  progress: number;
  deadline: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  tasks: number;
  status: 'online' | 'offline' | 'busy';
}

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  time: string;
  assignee: string;
}

// --- Mock Data ---

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Design System Update', assignee: 'Sarah Chen', priority: 'High', status: 'In Progress', progress: 65, deadline: '2024-03-25' },
  { id: 2, title: 'API Integration', assignee: 'Mike Ross', priority: 'High', status: 'To Do', progress: 0, deadline: '2024-03-28' },
  { id: 3, title: 'User Testing', assignee: 'Emma Wilson', priority: 'Medium', status: 'Done', progress: 100, deadline: '2024-03-20' },
  { id: 4, title: 'Mobile Responsiveness', assignee: 'Alex Turner', priority: 'Low', status: 'In Progress', progress: 45, deadline: '2024-04-05' },
  { id: 5, title: 'Database Migration', assignee: 'David Kim', priority: 'High', status: 'To Do', progress: 10, deadline: '2024-04-01' },
  { id: 6, title: 'Content Review', assignee: 'Sarah Chen', priority: 'Medium', status: 'Done', progress: 100, deadline: '2024-03-15' },
  { id: 7, title: 'Security Audit', assignee: 'Mike Ross', priority: 'High', status: 'Overdue', progress: 80, deadline: '2024-03-10' },
  { id: 8, title: 'Analytics Dashboard', assignee: 'Emma Wilson', priority: 'Medium', status: 'In Progress', progress: 30, deadline: '2024-04-10' },
];

const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, name: 'Sarah Chen', role: 'Lead Designer', avatar: 'https://i.pravatar.cc/150?u=1', tasks: 12, status: 'online' },
  { id: 2, name: 'Mike Ross', role: 'Senior Dev', avatar: 'https://i.pravatar.cc/150?u=2', tasks: 8, status: 'busy' },
  { id: 3, name: 'Emma Wilson', role: 'Product Manager', avatar: 'https://i.pravatar.cc/150?u=3', tasks: 5, status: 'offline' },
  { id: 4, name: 'Alex Turner', role: 'Frontend Dev', avatar: 'https://i.pravatar.cc/150?u=4', tasks: 15, status: 'online' },
  { id: 5, name: 'David Kim', role: 'Backend Dev', avatar: 'https://i.pravatar.cc/150?u=5', tasks: 9, status: 'online' },
];

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'To Do': 'bg-slate-100 text-slate-600 border-slate-200',
    'In Progress': 'bg-blue-50 text-blue-600 border-blue-200',
    'Done': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'Overdue': 'bg-red-50 text-red-600 border-red-200',
  }[status] || 'bg-gray-100 text-gray-600';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles = {
    'High': 'text-red-600 bg-red-50',
    'Medium': 'text-amber-600 bg-amber-50',
    'Low': 'text-emerald-600 bg-emerald-50',
  }[priority] || 'text-gray-600';

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles}`}>
      {priority}
    </span>
  );
};

export default function AdminDashboard({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Task Form State
  const [newTask, setNewTask] = useState({ title: '', assignee: '', priority: 'Medium', deadline: '' });
  
  // Event Form State
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', assignee: '' });

  // --- Handlers ---

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: tasks.length + 1,
      title: newTask.title,
      assignee: newTask.assignee,
      priority: newTask.priority as any,
      status: 'To Do',
      progress: 0,
      deadline: newTask.deadline,
    };
    setTasks([...tasks, task]);
    setNewTask({ title: '', assignee: '', priority: 'Medium', deadline: '' });
  };

  const handleAddEvent = (e: FormEvent) => {
    e.preventDefault();
    const event: CalendarEvent = {
      id: events.length + 1,
      title: newEvent.title,
      date: new Date(newEvent.date),
      time: newEvent.time,
      assignee: newEvent.assignee,
    };
    setEvents([...events, event]);
    setNewEvent({ title: '', date: '', time: '', assignee: '' });
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // --- Render Sections ---

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tasks', value: tasks.length, icon: CheckSquare, color: 'bg-blue-500' },
          { label: 'Completed', value: tasks.filter(t => t.status === 'Done').length, icon: CheckCircle2, color: 'bg-emerald-500' },
          { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, icon: Clock, color: 'bg-amber-500' },
          { label: 'Overdue', value: tasks.filter(t => t.status === 'Overdue').length, icon: AlertCircle, color: 'bg-red-500' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Assignment Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Assign New Task</h3>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={newTask.priority}
                  onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={newTask.deadline}
                  onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={newTask.assignee}
                onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                required
              >
                <option value="">Select Member</option>
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </form>
        </div>

        {/* Task Progress Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Task Progress</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Task Name</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{task.title}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {task.assignee.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-600">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            task.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`} 
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 mt-1 block">{task.progress}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{task.deadline}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart); // 0 = Sunday

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button 
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200 flex-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500 uppercase">
                {day}
              </div>
            ))}
            
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white p-2 min-h-[100px]" />
            ))}

            {days.map(day => {
              const dayEvents = events.filter(e => isSameDay(e.date, day));
              const isToday = isSameDay(day, new Date());
              
              return (
                <div key={day.toString()} className={`bg-white p-2 min-h-[100px] hover:bg-slate-50 transition-colors relative group ${isToday ? 'bg-blue-50/30' : ''}`}>
                  <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.map(event => (
                      <div key={event.id} className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded truncate">
                        {event.time} {event.title}
                      </div>
                    ))}
                  </div>
                  <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded text-blue-600 transition-all">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Add Event</h3>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={newEvent.title}
                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={newEvent.date}
                  onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={newEvent.time}
                  onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={newEvent.assignee}
                onChange={e => setNewEvent({ ...newEvent, assignee: e.target.value })}
              >
                <option value="">Select Member</option>
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Add to Calendar
            </button>
          </form>

          <div className="mt-8">
            <h4 className="font-semibold text-slate-800 mb-3">Upcoming Events</h4>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No upcoming events</p>
              ) : (
                events.slice(0, 3).map(event => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg text-center min-w-[50px]">
                      <span className="block text-xs font-bold uppercase">{format(event.date, 'MMM')}</span>
                      <span className="block text-lg font-bold leading-none">{format(event.date, 'd')}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{event.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{event.time} • {event.assignee}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTeam = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {TEAM_MEMBERS.map((member) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative group hover:shadow-md transition-all"
        >
          <button className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-5 h-5" />
          </button>
          
          <div className="relative mb-4">
            <img 
              src={member.avatar} 
              alt={member.name} 
              className="w-20 h-20 rounded-full object-cover border-4 border-slate-50"
            />
            <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
              member.status === 'online' ? 'bg-emerald-500' : 
              member.status === 'busy' ? 'bg-red-500' : 'bg-slate-400'
            }`} />
          </div>
          
          <h3 className="text-lg font-bold text-slate-800">{member.name}</h3>
          <p className="text-sm text-slate-500 mb-4">{member.role}</p>
          
          <div className="flex items-center gap-4 w-full justify-center border-t border-slate-100 pt-4 mt-auto">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{member.tasks}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Tasks</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">98%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Score</p>
            </div>
          </div>
          
          <button className="mt-6 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-lg transition-colors">
            View Profile
          </button>
        </motion.div>
      ))}
      
      <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all group min-h-[300px]">
        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
          <Plus className="w-6 h-6" />
        </div>
        <span className="font-medium">Add Team Member</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-slate-200 fixed h-full z-20 hidden md:flex flex-col shadow-sm"
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 h-20">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="font-bold text-xl tracking-tight text-slate-800"
            >
              CollabSpace
            </motion.span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
            { id: 'team', label: 'Team Members', icon: Users },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
              {sidebarOpen && <span>{item.label}</span>}
              {activeTab === item.id && sidebarOpen && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors ${!sidebarOpen && 'justify-center'}`}
          >
            <X className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:ml-[280px]' : 'md:ml-[80px]'}`}>
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-20 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 md:block hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
              />
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              
              <div className="h-8 w-px bg-slate-200 mx-2" />
              
              <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <img 
                  src="https://ui-avatars.com/api/?name=Admin+User&background=2563eb&color=fff" 
                  alt="Admin" 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="p-8 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && renderOverview()}
              {activeTab === 'tasks' && renderOverview()} {/* Reusing overview for tasks as requested structure was similar */}
              {activeTab === 'calendar' && renderCalendar()}
              {activeTab === 'team' && renderTeam()}
              {activeTab === 'reports' && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                  <FileText className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg">Reports module coming soon</p>
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                  <Settings className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg">System settings module coming soon</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
