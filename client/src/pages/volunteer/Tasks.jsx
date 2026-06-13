import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';

const STATUS_THEMES = {
    completed: 'bg-green-500/20 text-green-500',
    in_progress: 'bg-blue-500/20 text-blue-500',
    accepted: 'bg-sky-500/20 text-sky-500',
    pending: 'bg-yellow-500/20 text-yellow-500'
};

const VolunteerTasks = () => {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        try {
            const response = await api.get('/assignments');
            setTasks(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/assignments/${id}/status`, { status });
            setTasks((prev) =>
                prev.map((task) => (task.id === id ? { ...task, status } : task))
            );
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md"
            >
                <h2 className="text-xl font-semibold text-white mb-4">{t('volunteer.tasks')}</h2>

                {loading ? (
                    <p className="text-slate-400">{t('common.loading')}</p>
                ) : tasks.length > 0 ? (
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="p-4 bg-slate-800/60 border border-slate-700/30 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-white font-medium capitalize">{task.task_type.replace('_', ' ')}</h4>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_THEMES[task.status] || STATUS_THEMES.pending}`}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-sm mb-3">{task.description}</p>
                                
                                <div className="flex gap-2">
                                    {task.status === 'pending' && (
                                        <button
                                            onClick={() => updateStatus(task.id, 'accepted')}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            {t('volunteer.accept')}
                                        </button>
                                    )}
                                    {task.status === 'accepted' && (
                                        <button
                                            onClick={() => updateStatus(task.id, 'in_progress')}
                                            className="px-4 py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 transition-colors"
                                        >
                                            {t('volunteer.start')}
                                        </button>
                                    )}
                                    {task.status === 'in_progress' && (
                                        <button
                                            onClick={() => updateStatus(task.id, 'completed')}
                                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            {t('volunteer.complete')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400">{t('common.noData')}</p>
                )}
            </motion.div>
        </div>
    );
};

export default VolunteerTasks;