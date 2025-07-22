import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import axios from "axios"
import "dotenv/config"

type SimilarityMetric = 'dot_product' | 'cosine' | 'euclidean'

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    HF_API_TOKEN,
} = process.env

const jobData = [
    'https://en.wikipedia.org/wiki/Software_engineer',
    'https://en.wikipedia.org/wiki/Data_analyst',
    'https://en.wikipedia.org/wiki/Graphic_designer',
    'https://en.wikipedia.org/wiki/Internship',
    'https://en.wikipedia.org/wiki/Job_interview',
    'https://en.wikipedia.org/wiki/Google',
    'https://en.wikipedia.org/wiki/Ubisoft',
    'https://en.wikipedia.org/wiki/Fintech',
    'https://www.coursera.org/articles/what-does-a-software-engineer-do',
    'https://www.coursera.org/articles/what-does-a-data-analyst-do',
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
})

const getEmbeddingFromHF = async (text: string): Promise<number[]> => {

    const dimension = 1536; 
    const embedding = Array.from({ length: dimension }, () => Math.random() * 2 - 1);
    
  
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
}

const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    try {
       
        const collections = await db.listCollections();
        if (collections.some((col: any) => col.name === ASTRA_DB_COLLECTION)) {
            console.log(`La collection '${ASTRA_DB_COLLECTION}' existe déjà. Création ignorée.`);
            return;
        }
        const res = await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: 1536,
                metric: similarityMetric,
            },
        });
        console.log(res);
    } catch (error: any) {
        console.error('Erreur lors de la création de la collection:', error.message);
    }
}

const loadsampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await (const url of jobData) {
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for (const chunk of chunks) {
      
            const cleanChunk = chunk
                .replace(/[\[\]]/g, '') 
                .replace(/\s+/g, ' ')   
                .trim()
            
 
            if (!cleanChunk || 
                cleanChunk.length < 30 || 
                cleanChunk.length > 500 ||
                !/[a-zA-Z]{3,}/.test(cleanChunk) ||
                cleanChunk.includes('[edit]') ||
                cleanChunk.includes('Main menu') ||
                cleanChunk.includes('Jump to content')) {
                continue;
            }
            
            try {
                const vector = await getEmbeddingFromHF(cleanChunk)

                const res = await collection.insertOne({
                    $vector: vector,
                    text: cleanChunk,
                })
                console.log(res)

            } catch (error: any) {
                console.error(`❌ Erreur sur le chunk : ${cleanChunk.slice(0, 50)}...`)
                console.error(error.message)
            }
        }
    }
}

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true,
        },
        gotoOptions: {
            waitUntil: "domcontentloaded",
        },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerText)
            await browser.close()
            return result
        },
    })
    return await loader.scrape()
}


createCollection().then(() => loadsampleData())
