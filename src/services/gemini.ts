import {GoogleGenAI} from '@google/genai'
import {env} from '../env.ts'

const gemini = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
})

const model = 'gemini-2.5-flash'

export async function transcribeAudio(audioAsBase64:string, mimeType:string){
    const response = await gemini.models.generateContent({
        model,
        contents: [
            {
                text: 'Transcreva o áudio para português do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando for apropriado.',
            },{
                inlineData:{
                    mimeType,
                    data: audioAsBase64,
                }
            }
        ],
    })
    if(!response.text) {
        throw new Error('Failed to transcribe audio.')
    }
    return response.text
}

export async function generateEmbeddings(text: string) {
    const response = await gemini.models.embedContent({
        model: 'text-embedding-004',
        contents: [{text}],
        config: {
            taskType: 'RETRIEVAL_DOCUMENT'
        }
    })

    if(!response.embeddings?.[0].values){
        throw new Error('Failed to generate embeddings.')
    }
    return response.embeddings[0].values
}

export async function generateAnswer(question: string, transcriptions: string[]){
    const context = transcriptions.join('\n\n')

    const prompt = `
        Com base no texto fornecido abaixo como contexto, responda a pergunta de forma clara e objetiva em português do Brasil.

        CONTEXTO: 
            ${context}

        PERGUNTA:
            ${question}

        INSTRUÇÕES:
            - Use apenas informações do contexto fornecido;
            - Se a resposta não for encontrada no contexto, apenas responda que não possui informações suficientes para responder;
            - Seja conciso e direto ao ponto;
            - Mantenha um tom profissional e educativo, a final das contas serão estudantes que irão tirar dúvidas;
            - Cite trechos relevantes do contexto se apropriado;
            - Se for citar o contexto, utilize o termo "conteúdo da aula";
    `.trim()

    const response = await gemini.models.generateContent({
        model,
        contents: [{
            text: prompt
        }]
    })

    if(!response.text) {
        throw new Error('Failed to generate answer.')
    }

    return response.text
}
