import React, { useState, useMemo } from 'react';
import { AnalyticsData, Cohort, Feedback, User, FeedbackType, FeedbackStatus } from '../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, AreaChart, Area, BarChart, Bar
} from 'recharts';

interface AdminPageProps {
  analyticsData: AnalyticsData[];
  retentionData: Cohort[];
  feedback: Feedback[];
  allUsers: { [key: string]: User };
  onUpdateFeedbackStatus: (feedbackId: number, newStatus: FeedbackStatus) => void;
  onAddPersona: (personaData: Pick<User, 'name' | 'avatarUrl' | 'bio'>) => void;
  onGenerateAIPost: (personaId: string) => void;
  generatingPostPersonaId: string | null;
}

// --- Reusable Components ---

const StatCard: React.FC<{ title: string; value: string; icon: string }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-[#242526] p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-violet-100 dark:bg-violet-900/50 p-3 rounded-full">
            <i className={`fa-solid ${icon} text-xl text-accent`}></i>
        </div>
        <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{value}</p>
        </div>
    </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#3A3B3C] p-4 border border-neutral-200 dark:border-neutral-600 rounded-lg shadow-lg">
                <p className="font-bold mb-2">{label}</p>
                {payload.map((p: any) => (
                     <p key={p.dataKey} style={{ color: p.color || p.fill }}>
                       {p.name}: {p.value.toLocaleString()}{p.unit || ''}
                     </p>
                ))}
            </div>
        );
    }
    return null;
};

// --- Chart Components ---

const UserActivityChart: React.FC<{ data: AnalyticsData[] }> = ({ data }) => {
    const [visibleSeries, setVisibleSeries] = useState({ dau: true, wau: true, mau: true });

    const handleLegendClick = (e: any) => {
        const { dataKey } = e;
        setVisibleSeries(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
    };

    return (
        <ResponsiveContainer width="100%" height={500}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="displayDate" tick={{ fill: 'var(--color-text-secondary)' }} />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('en', { notation: 'compact' }).format(value)} tick={{ fill: 'var(--color-text-secondary)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend onClick={handleLegendClick} />
                <Line type="monotone" name="DAU" dataKey="dau" stroke="#8884d8" strokeWidth={2} dot={false} hide={!visibleSeries.dau} />
                <Line type="monotone" name="WAU" dataKey="wau" stroke="#82ca9d" strokeWidth={2} dot={false} hide={!visibleSeries.wau} />
                <Line type="monotone" name="MAU" dataKey="mau" stroke="#ffc658" strokeWidth={2} dot={false} hide={!visibleSeries.mau} />
                <Brush dataKey="displayDate" height={30} stroke="#a452fd">
                   <AreaChart>
                        <Area dataKey="dau" fill="#8884d8" fillOpacity={0.5} stroke="false" />
                    </AreaChart>
                </Brush>
            </LineChart>
        </ResponsiveContainer>
    );
};

const SignupsChart: React.FC<{ data: AnalyticsData[] }> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ff7300" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="displayDate" tick={{ fill: 'var(--color-text-secondary)' }} />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('en', { notation: 'compact' }).format(value)} tick={{ fill: 'var(--color-text-secondary)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" name="Signups" dataKey="signups" stroke="#ff7300" strokeWidth={2} fillOpacity={1} fill="url(#colorSignups)" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RetentionChart: React.FC<{ data: Cohort[] }> = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        const maxWeeks = data.reduce((max, cohort) => Math.max(max, cohort.retention.length), 0);
        
        const transformed = [];
        for (let i = 0; i < maxWeeks; i++) {
            const weekPoint: { [key: string]: string | number } = { name: `Week ${i}` };
            data.forEach(cohort => {
                if (cohort.retention[i] !== null) {
                    weekPoint[cohort.week] = cohort.retention[i]!;
                }
            });
            transformed.push(weekPoint);
        }
        return transformed;
    }, [data]);

    if (!data || data.length === 0) return null;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)' }} />
                <YAxis unit="%" tick={{ fill: 'var(--color-text-secondary)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {data.map((cohort, index) => (
                    <Line 
                        key={cohort.week} 
                        type="monotone" 
                        dataKey={cohort.week} 
                        stroke={COLORS[index % COLORS.length]} 
                        strokeWidth={2} 
                        dot={false}
                        connectNulls={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};


const BreakdownBarChart: React.FC<{ data: { name: string; value: number }[]; barKey: string; fill: string; }> = ({ data, barKey, fill }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis type="number" tickFormatter={(value) => new Intl.NumberFormat('en', { notation: 'compact' }).format(value)} tick={{ fill: 'var(--color-text-secondary)' }} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}/>
            <Bar dataKey={barKey} name="Count" fill={fill} />
        </BarChart>
    </ResponsiveContainer>
);

// --- Feedback Components ---
const FeedbackTable: React.FC<{ feedback: Feedback[], allUsers: { [key: string]: User }, onUpdateFeedbackStatus: (id: number, status: FeedbackStatus) => void }> = ({ feedback, allUsers, onUpdateFeedbackStatus }) => {
    
    const getBadgeClass = (type: FeedbackType | FeedbackStatus) => {
        switch(type) {
            case 'bug': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            case 'feature': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case 'general': return 'bg-neutral-200 text-neutral-800 dark:bg-neutral-600 dark:text-neutral-200';
            case 'new': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300';
            case 'inProgress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            default: return '';
        }
    };

    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-neutral-500 dark:text-neutral-400">
                    <thead className="text-xs text-neutral-700 dark:text-neutral-300 uppercase bg-neutral-50 dark:bg-[#3A3B3C]">
                        <tr>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Feedback</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedback.map(item => {
                            const user = allUsers[item.userId];
                            return (
                                <tr key={item.id} className="bg-white dark:bg-[#242526] border-b dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-[#3A3B3C]">
                                    <td className="px-6 py-4">
                                        {user ? (
                                            <div className="flex items-center space-x-3">
                                                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                                <span className="font-medium text-neutral-900 dark:text-white whitespace-nowrap">{user.name}</span>
                                            </div>
                                        ) : 'Unknown User'}
                                    </td>
                                    <td className="px-6 py-4 max-w-sm">
                                        <p className="line-clamp-3">{item.text}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getBadgeClass(item.type)}`}>{item.type}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatTimestamp(item.timestamp)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getBadgeClass(item.status)}`}>{item.status.replace('inProgress', 'In Progress')}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={item.status}
                                            onChange={(e) => onUpdateFeedbackStatus(item.id, e.target.value as FeedbackStatus)}
                                            className="bg-neutral-100 dark:bg-[#3A3B3C] border border-neutral-300 dark:border-neutral-500 rounded-md p-1.5 text-xs focus:ring-accent focus:border-accent"
                                        >
                                            <option value="new">New</option>
                                            <option value="inProgress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Persona Manager Components ---
const PersonaManager: React.FC<{ users: { [key: string]: User }, onAddPersona: (data: any) => void, onGenerateAIPost: (id: string) => void, generatingPostPersonaId: string | null }> = ({ users, onAddPersona, onGenerateAIPost, generatingPostPersonaId }) => {
    const [newPersona, setNewPersona] = useState({ name: '', avatarUrl: '', bio: '' });

    // FIX: Explicitly typed the 'u' parameter in filter to avoid errors from accessing properties on an 'unknown' type.
    const personas = useMemo(() => Object.values(users).filter((u: User) => u.isPersona), [users]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewPersona(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPersona = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPersona.name && newPersona.avatarUrl && newPersona.bio) {
            onAddPersona(newPersona);
            setNewPersona({ name: '', avatarUrl: '', bio: '' });
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-[#242526] p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Create New Persona</h2>
                    <form onSubmit={handleAddPersona} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</label>
                            <input type="text" name="name" id="name" value={newPersona.name} onChange={handleInputChange} className="mt-1 w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none" required />
                        </div>
                        <div>
                            <label htmlFor="avatarUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Avatar URL</label>
                            <input type="url" name="avatarUrl" id="avatarUrl" value={newPersona.avatarUrl} onChange={handleInputChange} className="mt-1 w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none" required />
                        </div>
                         <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Bio / AI System Prompt</label>
                            <textarea name="bio" id="bio" rows={5} value={newPersona.bio} onChange={handleInputChange} className="mt-1 w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none" required />
                             <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">This bio will be used as the system prompt to define the persona's voice and expertise for the AI.</p>
                        </div>
                        <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-accent-text-over font-bold py-2 px-4 rounded-lg transition-colors">Add Persona</button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-[#242526] p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Manage Personas ({personas.length})</h2>
                    <div className="space-y-4">
                        {personas.map(persona => (
                            <div key={persona.id} className="flex items-start space-x-4 p-4 bg-neutral-50 dark:bg-[#3A3B3C] rounded-lg">
                                <img src={persona.avatarUrl} alt={persona.name} className="w-16 h-16 rounded-full flex-shrink-0" />
                                <div className="flex-grow">
                                    <h3 className="font-bold">{persona.name}</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3">{persona.bio}</p>
                                    <button
                                        onClick={() => onGenerateAIPost(persona.id)}
                                        disabled={!!generatingPostPersonaId}
                                        className="mt-2 bg-violet-100 hover:bg-violet-200 text-accent dark:bg-violet-900/50 dark:hover:bg-violet-900/80 font-semibold py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {generatingPostPersonaId === persona.id ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                                Generating...
                                            </>
                                        ) : (
                                             <>
                                                <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                                                Generate Post
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
type AdminTab = 'analytics' | 'feedback' | 'personas';

const AdminPage: React.FC<AdminPageProps> = ({ analyticsData, retentionData, feedback, allUsers, onUpdateFeedbackStatus, onAddPersona, onGenerateAIPost, generatingPostPersonaId }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
    const today = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 29));
    const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const setDateRange = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const filteredData = useMemo(() => {
        if (!analyticsData) return [];
        return analyticsData.filter(d => d.isoDate >= startDate && d.isoDate <= endDate);
    }, [analyticsData, startDate, endDate]);

    const { summaryStats, screenViewTotals, buttonClickTotals } = useMemo(() => {
        const stats = filteredData.reduce<{
            signups: number;
            screenViews: { [key: string]: number };
            buttonClicks: { [key: string]: number };
        }>((acc, day) => {
            acc.signups += day.signups;
            
            for (const screen in day.screenViews) {
                const key = screen as keyof typeof day.screenViews;
                acc.screenViews[key] = (acc.screenViews[key] || 0) + day.screenViews[key];
            }
            for (const button in day.buttonClicks) {
                const key = button as keyof typeof day.buttonClicks;
                acc.buttonClicks[key] = (acc.buttonClicks[key] || 0) + day.buttonClicks[key];
            }
            
            return acc;
        }, {
            signups: 0,
            screenViews: {},
            buttonClicks: {},
        });

        // FIX: Added generic type argument to reduce and handled potentially undefined values to prevent type errors.
        const totalScreenViews = Object.values(stats.screenViews).reduce<number>((sum, count) => sum + (count || 0), 0);
        // FIX: Added generic type argument to reduce and handled potentially undefined values to prevent type errors.
        const totalButtonClicks = Object.values(stats.buttonClicks).reduce<number>((sum, count) => sum + (count || 0), 0);

        const formatName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');

        return {
            summaryStats: { signups: stats.signups, screenViews: totalScreenViews, buttonClicks: totalButtonClicks },
            screenViewTotals: Object.entries(stats.screenViews)
                .map(([name, value]) => ({ name: formatName(name), value }))
                .sort((a, b) => b.value - a.value),
            buttonClickTotals: Object.entries(stats.buttonClicks)
                .map(([name, value]) => ({ name: formatName(name), value }))
                .sort((a, b) => b.value - a.value),
        };
    }, [filteredData]);

    const latestDau = filteredData.length > 0 ? filteredData[filteredData.length - 1].dau : 0;
    
    const getColorForRetention = (percentage: number | null) => {
        if (percentage === null || percentage < 0) return 'bg-neutral-100 dark:bg-neutral-700/50';
        if (percentage > 60) return 'bg-violet-600 text-white';
        if (percentage > 40) return 'bg-violet-500 text-white';
        if (percentage > 20) return 'bg-violet-400 text-neutral-800';
        if (percentage > 10) return 'bg-violet-300 text-neutral-800';
        if (percentage > 5) return 'bg-violet-200 text-neutral-800';
        return 'bg-violet-100 text-neutral-800';
    };

    const sortedFeedback = useMemo(() => {
        return [...feedback].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [feedback]);

    const renderAnalyticsContent = () => (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div/> {/* Spacer */}
                 <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setDateRange(7)} className="px-3 py-1 text-sm font-semibold bg-neutral-200 dark:bg-[#3A3B3C] hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-md transition-colors">7D</button>
                    <button onClick={() => setDateRange(30)} className="px-3 py-1 text-sm font-semibold bg-neutral-200 dark:bg-[#3A3B3C] hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-md transition-colors">30D</button>
                    <button onClick={() => setDateRange(365)} className="px-3 py-1 text-sm font-semibold bg-neutral-200 dark:bg-[#3A3B3C] hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-md transition-colors">1Y</button>
                    <button onClick={() => setDateRange(365 * 2)} className="px-3 py-1 text-sm font-semibold bg-neutral-200 dark:bg-[#3A3B3C] hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-md transition-colors">2Y</button>
                    <button onClick={() => setDateRange(365 * 3)} className="px-3 py-1 text-sm font-semibold bg-neutral-200 dark:bg-[#3A3B3C] hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-md transition-colors">3Y</button>
                    <div className="flex items-center gap-2">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-1 text-sm border border-neutral-300 dark:border-neutral-500"/>
                        <span>to</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-1 text-sm border border-neutral-300 dark:border-neutral-500"/>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Total User Signups" value={summaryStats.signups.toLocaleString()} icon="fa-user-plus" />
                <StatCard title="Daily Active Users" value={latestDau.toLocaleString()} icon="fa-users" />
                <StatCard title="Total Screen Views" value={summaryStats.screenViews.toLocaleString()} icon="fa-eye" />
                <StatCard title="Total Button Clicks" value={summaryStats.buttonClicks.toLocaleString()} icon="fa-hand-pointer" />
            </div>
            <div className="bg-white dark:bg-[#242526] p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">User Activity</h2>
                {filteredData.length > 0 ? <UserActivityChart data={filteredData} /> : <div className="h-[500px] flex items-center justify-center text-neutral-500 dark:text-neutral-400"><p>No data available for the selected range.</p></div>}
            </div>
            <div className="bg-white dark:bg-[#242526] p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Daily Signups</h2>
                {filteredData.length > 0 ? <SignupsChart data={filteredData} /> : <div className="h-[400px] flex items-center justify-center text-neutral-500 dark:text-neutral-400"><p>No data available for the selected range.</p></div>}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#242526] p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Screen Views Breakdown</h2>
                    <BreakdownBarChart data={screenViewTotals} barKey="value" fill="#82ca9d" />
                </div>
                 <div className="bg-white dark:bg-[#242526] p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Button Click Breakdown</h2>
                    <BreakdownBarChart data={buttonClickTotals} barKey="value" fill="#ffc658" />
                </div>
            </div>
            <div className="bg-white dark:bg-[#242526] p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">User Retention Analysis</h2>
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Retention by Cohort</h3>
                    {retentionData.length > 0 ? <RetentionChart data={retentionData} /> : <div className="h-[400px] flex items-center justify-center text-neutral-500 dark:text-neutral-400"><p>No retention data available.</p></div>}
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Weekly Retention Grid</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-neutral-700 dark:text-neutral-300 uppercase bg-neutral-50 dark:bg-[#3A3B3C]">
                            <tr>
                                <th scope="col" className="px-4 py-3">Cohort</th>
                                <th scope="col" className="px-4 py-3">New Users</th>
                                {retentionData[0]?.retention.map((_, index) => <th key={index} scope="col" className="px-4 py-3 text-center">Week {index}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {retentionData.map(cohort => (
                                <tr key={cohort.week} className="border-b dark:border-neutral-700">
                                    <td className="px-4 py-3 font-medium">{cohort.week}</td>
                                    <td className="px-4 py-3">{cohort.newUsers.toLocaleString()}</td>
                                    {cohort.retention.map((p, index) => (
                                        <td key={index} className={`px-4 py-3 text-center font-semibold ${getColorForRetention(p)}`}>
                                            {p !== null ? `${p}%` : ''}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    const renderFeedbackContent = () => (
        <FeedbackTable feedback={sortedFeedback} allUsers={allUsers} onUpdateFeedbackStatus={onUpdateFeedbackStatus} />
    );
    
    const renderPersonasContent = () => (
        <PersonaManager users={allUsers} onAddPersona={onAddPersona} onGenerateAIPost={onGenerateAIPost} generatingPostPersonaId={generatingPostPersonaId} />
    );

    return (
        <div className="flex-grow w-full mx-auto px-4 md:px-6 py-8 space-y-6 animate-fade-in-slide-up">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Admin Dashboard</h1>

            <div className="border-b border-neutral-200 dark:border-neutral-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`${
                            activeTab === 'analytics'
                                ? 'border-accent text-accent'
                                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-500'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`${
                            activeTab === 'feedback'
                                ? 'border-accent text-accent'
                                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-500'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        User Feedback
                    </button>
                    <button
                        onClick={() => setActiveTab('personas')}
                        className={`${
                            activeTab === 'personas'
                                ? 'border-accent text-accent'
                                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-500'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        Personas
                    </button>
                </nav>
            </div>
            
            {activeTab === 'analytics' && renderAnalyticsContent()}
            {activeTab === 'feedback' && renderFeedbackContent()}
            {activeTab === 'personas' && renderPersonasContent()}
        </div>
    );
};

export default AdminPage;
