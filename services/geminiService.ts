
import { GoogleGenAI, Type } from "@google/genai";
import { MonitoringPayload, AnalysisResult, IncidentSeverity } from "../types";

const SYSTEM_INSTRUCTION = `
Você é um assistente especialista em observabilidade, monitoramento de aplicações web e resposta a incidentes em ambientes de nuvem (SRE/DevOps).
Seu papel é analisar métricas técnicas de disponibilidade oriundas de sistemas de monitoramento como AWS CloudWatch e transformá-las em alertas claros, objetivos e acionáveis.

Você deve:
- Classificar a gravidade do incidente (Baixa, Média ou Alta)
- Explicar o problema em linguagem natural
- Descrever o impacto para o negócio de forma clara
- Sugerir ações corretivas iniciais baseadas em boas práticas de nuvem
- Produzir uma mensagem de alerta profissional pronta para envio

Use linguagem profissional, clara e direta em Português (Brasil).
`;

export const analyzeIncident = async (payload: MonitoringPayload): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const prompt = `
  Analise as métricas abaixo, simuladas a partir de um sistema de monitoramento em nuvem:

  Site monitorado: ${payload.site}
  Ambiente: ${payload.environment}
  Status atual: ${payload.status}
  Tempo de indisponibilidade: ${payload.downtime_minutes} minutos
  Latência média: ${payload.average_latency_ms} ms
  Falhas consecutivas: ${payload.failed_checks}
  Horário do evento: ${payload.timestamp}

  Tarefas:
  1. Classifique a gravidade do incidente (Baixa, Média ou Alta)
  2. Explique o problema em linguagem natural
  3. Descreva o impacto para o negócio
  4. Sugira ações corretivas iniciais
  5. Gere um alerta profissional pronto para envio via e-mail ou chat corporativo

  Retorne o resultado estritamente em formato JSON com a seguinte estrutura:
  {
    "severity": "BAIXA" | "MÉDIA" | "ALTA",
    "explanation": "string",
    "businessImpact": "string",
    "correctiveActions": ["string", "string"],
    "professionalAlert": "string"
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING },
            explanation: { type: Type.STRING },
            businessImpact: { type: Type.STRING },
            correctiveActions: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            professionalAlert: { type: Type.STRING }
          },
          required: ["severity", "explanation", "businessImpact", "correctiveActions", "professionalAlert"]
        }
      },
    });

    const data = JSON.parse(response.text || '{}');
    
    // Mapeamento de severidade para o enum interno
    let mappedSeverity = IncidentSeverity.LOW;
    const sev = data.severity?.toUpperCase() || "";
    if (sev.includes('ALTA')) mappedSeverity = IncidentSeverity.HIGH;
    else if (sev.includes('MÉDIA') || sev.includes('MEDIA')) mappedSeverity = IncidentSeverity.MEDIUM;

    return {
      severity: mappedSeverity,
      explanation: data.explanation,
      businessImpact: data.businessImpact,
      correctiveActions: data.correctiveActions,
      professionalAlert: data.professionalAlert,
      rawMarkdown: response.text || ''
    };
  } catch (error) {
    console.error("Erro na análise do Gemini:", error);
    throw error;
  }
};
