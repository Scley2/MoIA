
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Send, 
  History, 
  ChevronRight,
  Loader2,
  RefreshCw,
  Terminal,
  FileJson,
  LayoutDashboard
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  MonitoringPayload, 
  AnalysisResult, 
  SiteStatus, 
  IncidentSeverity,
  AlertHistoryItem 
} from './types';
import { analyzeIncident } from './services/geminiService';

const latencyData = [
  { time: '14:20', latency: 320 },
  { time: '14:22', latency: 345 },
  { time: '14:24', latency: 410 },
  { time: '14:26', latency: 520 },
  { time: '14:28', latency: 850 },
  { time: '14:30', latency: 1200 },
  { time: '14:32', latency: 1200 },
];

const DEFAULT_PAYLOAD: MonitoringPayload = {
  site: "meusite.com",
  environment: "production",
  status: SiteStatus.DOWN,
  downtime_minutes: 4,
  average_latency_ms: 1200,
  failed_checks: 3,
  timestamp: new Date().toISOString()
};

const App: React.FC = () => {
  const [payload, setPayload] = useState<MonitoringPayload>(DEFAULT_PAYLOAD);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AlertHistoryItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeIncident(payload);
      setAnalysis(result);
      const historyItem: AlertHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        payload: { ...payload },
        result,
        timestamp: new Date()
      };
      setHistory(prev => [historyItem, ...prev]);
    } catch (error) {
      alert("Erro ao analisar incidente. Verifique sua conexão e chave de API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.HIGH: return 'text-red-600 bg-red-50 border-red-200';
      case IncidentSeverity.MEDIUM: return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  const getStatusColor = (status: SiteStatus) => {
    return status === SiteStatus.UP ? 'text-emerald-500' : 'text-red-500';
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-white border-r border-slate-200 p-6 flex flex-col shadow-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800">MoIA</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Painel de Controle
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <History className="w-5 h-5" />
            Histórico de Incidentes
          </button>
        </nav>

        <div className="mt-auto p-4 bg-slate-100 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Cpu className="w-4 h-4" />
            Tecnologia
          </div>
          <div className="font-medium text-slate-700">Google Gemini 3.0</div>
          <div className="text-xs text-slate-500 mt-1">Camada de IA Inteligente</div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 lg:p-12">
        {activeTab === 'dashboard' ? (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Cabeçalho */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Motor de Observabilidade</h2>
                <p className="text-slate-500">Simule métricas e dispare análises de incidentes com IA.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setPayload(DEFAULT_PAYLOAD)}
                  className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Redefinir Dados
                </button>
                <button 
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Terminal className="w-5 h-5" />}
                  Executar Análise
                </button>
              </div>
            </header>

            {/* Entrada de Métricas e Simulação */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                {/* Gráfico Visual */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-500" />
                      Tendência de Latência (ms)
                    </h3>
                    <span className="text-xs text-slate-400">Simulação em Tempo Real</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={latencyData}>
                        <defs>
                          <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="latency" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Formulário de Dados */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-indigo-500" />
                    Dados de Entrada (Payload)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-600">Site Monitorado</label>
                      <input 
                        type="text" 
                        value={payload.site}
                        onChange={e => setPayload({...payload, site: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-600">Ambiente</label>
                      <select 
                        value={payload.environment}
                        onChange={e => setPayload({...payload, environment: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="production">Produção</option>
                        <option value="staging">Staging</option>
                        <option value="development">Desenvolvimento</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-600">Status Atual</label>
                      <select 
                        value={payload.status}
                        onChange={e => setPayload({...payload, status: e.target.value as SiteStatus})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={SiteStatus.UP}>UP (Ativo)</option>
                        <option value={SiteStatus.DOWN}>DOWN (Inativo)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-600">Tempo de Queda (minutos)</label>
                      <input 
                        type="number" 
                        value={payload.downtime_minutes}
                        onChange={e => setPayload({...payload, downtime_minutes: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-600">Latência Média (ms)</label>
                      <input 
                        type="number" 
                        value={payload.average_latency_ms}
                        onChange={e => setPayload({...payload, average_latency_ms: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-600">Falhas de Verificação</label>
                      <input 
                        type="number" 
                        value={payload.failed_checks}
                        onChange={e => setPayload({...payload, failed_checks: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards de Status Rápido */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-slate-500 text-sm mb-1">Status Atual</h4>
                  <div className={`text-2xl font-bold ${getStatusColor(payload.status)}`}>
                    {payload.status === SiteStatus.UP ? 'OPERACIONAL' : 'FORA DO AR'}
                  </div>
                  <div className="mt-4 flex gap-4">
                    <div className="flex-1">
                      <div className="text-xs text-slate-400 uppercase">Ambiente</div>
                      <div className="font-medium capitalize">{payload.environment === 'production' ? 'Produção' : payload.environment}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-400 uppercase">Falhas</div>
                      <div className="font-medium text-red-500">{payload.failed_checks} tentativas</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-slate-500 text-sm mb-1">Duração do Incidente</h4>
                  <div className="text-2xl font-bold text-slate-800">
                    {payload.downtime_minutes} min
                  </div>
                  <div className="mt-2 text-xs text-slate-400">Registrado às {new Date(payload.timestamp).toLocaleTimeString('pt-BR')}</div>
                </div>

                <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-200 text-white overflow-hidden relative">
                  <Activity className="absolute -bottom-4 -right-4 w-24 h-24 text-indigo-500 opacity-20" />
                  <h4 className="text-indigo-100 text-sm mb-1">Latência Média</h4>
                  <div className="text-2xl font-bold">
                    {payload.average_latency_ms} <span className="text-sm font-normal">ms</span>
                  </div>
                  <div className="mt-4 text-xs text-indigo-100 leading-relaxed">
                    A latência está {payload.average_latency_ms > 500 ? 'acima do limite crítico' : 'dentro dos parâmetros normais'}.
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado da Análise */}
            {analysis && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl border ${getSeverityColor(analysis.severity)}`}>
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">Análise Gemini IA</div>
                        <h3 className="text-2xl font-bold text-slate-800">
                          Incidente de Gravidade {analysis.severity === IncidentSeverity.HIGH ? 'Alta' : analysis.severity === IncidentSeverity.MEDIUM ? 'Média' : 'Baixa'}
                        </h3>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-slate-900 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                        <Send className="w-4 h-4" />
                        Enviar para Slack/Teams
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <section>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Resumo do Problema</h4>
                        <p className="text-slate-700 leading-relaxed text-lg">
                          {analysis.explanation}
                        </p>
                      </section>

                      <section>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Impacto no Negócio</h4>
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-800 leading-relaxed font-medium">
                          {analysis.businessImpact}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-8">
                      <section>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Ações Recomendadas</h4>
                        <ul className="space-y-3">
                          {analysis.correctiveActions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 group hover:border-indigo-200 transition-all">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                                {idx + 1}
                              </div>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Alerta para Canais Oficiais</h4>
                        <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-700">
                          {analysis.professionalAlert}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
             <header>
                <h2 className="text-2xl font-bold text-slate-800">Histórico de Incidentes</h2>
                <p className="text-slate-500">Registro de todas as análises de IA geradas nesta sessão.</p>
              </header>

              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="bg-white p-20 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                    <History className="w-12 h-12 mb-4 opacity-20" />
                    <p>Nenhum histórico disponível. Realize uma análise no painel principal.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-indigo-300 transition-all cursor-pointer">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${getSeverityColor(item.result.severity)}`}>
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="font-bold text-slate-800 truncate">{item.payload.site}</span>
                           <span className="text-xs text-slate-400">•</span>
                           <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter">{item.payload.environment === 'production' ? 'Produção' : item.payload.environment}</span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1">{item.result.explanation}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Horário</div>
                        <div className="text-sm font-medium text-slate-600">{item.timestamp.toLocaleTimeString('pt-BR')}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  ))
                )}
              </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
