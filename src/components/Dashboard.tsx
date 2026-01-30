import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, FileText, Image, Star, Clock, Zap } from 'lucide-react';
import { funnelConfig } from '@/data/funnels';
import type { DashboardStats } from '@/types';

interface DashboardProps {
  stats: DashboardStats;
  weeklyData: { day: string; copies: number; images: number }[];
  funnelDistribution: { name: string; value: number; color: string }[];
}

export function Dashboard({ stats, weeklyData, funnelDistribution }: DashboardProps) {
  const cards = [
    {
      icon: FileText,
      label: 'Copies Generados',
      value: stats.totalGenerated,
      subtext: `${stats.copiesThisWeek} esta semana`,
      color: '#a855f7'
    },
    {
      icon: Image,
      label: 'Imágenes Generadas',
      value: stats.imagesThisWeek,
      subtext: 'esta semana',
      color: '#2D8BC9'
    },
    {
      icon: Star,
      label: 'Funnel Más Usado',
      value: stats.favoriteFunnel.toUpperCase(),
      subtext: funnelConfig[stats.favoriteFunnel]?.name || '',
      color: funnelConfig[stats.favoriteFunnel]?.color || '#888'
    },
    {
      icon: Clock,
      label: 'Promedio de Palabras',
      value: stats.averageWords,
      subtext: 'por copy',
      color: '#4ade80'
    },
    {
      icon: Zap,
      label: 'Repetidos Evitados',
      value: stats.duplicatesAvoided,
      subtext: 'por el sistema',
      color: '#ff6b35'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${card.color}20` }}
              >
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
            <div className="text-xs text-muted-foreground">{card.label}</div>
            <div className="text-xs text-muted-foreground/70 mt-1">{card.subtext}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#a855f7]" />
            <h3 className="font-semibold">Actividad Semanal</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#888', fontSize: 12 }}
                  axisLine={{ stroke: '#333' }}
                />
                <YAxis 
                  tick={{ fill: '#888', fontSize: 12 }}
                  axisLine={{ stroke: '#333' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="copies" fill="#a855f7" radius={[4, 4, 0, 0]} name="Copies" />
                <Bar dataKey="images" fill="#2D8BC9" radius={[4, 4, 0, 0]} name="Imágenes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Funnel Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[#ff6b35]" />
            <h3 className="font-semibold">Distribución por Funnel</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={funnelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {funnelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {funnelDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
