// src/components/ConnectionsTab.tsx
import React, { useEffect, useState } from 'react';
import { useThemeStore, getThemeClasses } from '../store/themeStore';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { Loader, Users } from 'lucide-react';

const ConnectionsTab = () => {
  const { id } = useParams();
  const { theme } = useThemeStore();
  const themeClasses = getThemeClasses(theme);
  const { projects } = useProjectStore();
  const project = projects.find(p => p.id === id);
  const [connections, setConnections] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!project) return;
      setLoading(true);

      try {
        const prompt = `List some individuals who have started small businesses in College Park, Maryland related to: ${project.tags.join(', ')}. Include some background info on each.`;

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt })
        });

        const data = await res.json();
        setConnections(data.reply);
      } catch (err) {
        console.error('Failed to fetch local connections:', err);
        setConnections('Could not fetch connections at this time.');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [project]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-indigo-600" />
        <h3 className={`text-lg font-semibold ${themeClasses.text}`}>Local Founders (AI)</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader className="animate-spin h-4 w-4" /> Fetching insights from Gemini...
        </div>
      ) : (
        <pre className={`whitespace-pre-wrap text-sm ${themeClasses.subtext}`}>{connections}</pre>
      )}
    </div>
  );
};

export default ConnectionsTab;
