// Model configurations (Updated with info_url)
const models = [
    {
        id: 'chatgpt',
        name: 'ChatGPT',
        company: 'OpenAI',
        url: 'https://chat.openai.com/',
        info_url: 'https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview',
        color: 'green',
        icon: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z',
        strengths: ['Coding & Programming', 'Mathematical Reasoning', 'Creative Writing'],
        useCases: ['Software development', 'Problem solving', 'Content creation']
    },
    {
        id: 'gemini',
        name: 'Gemini',
        company: 'Google',
        url: 'https://gemini.google.com/',
        info_url: 'https://gemini.google/overview/',
        color: 'blue',
        icon: 'M12 0l3.09 6.26L22 9l-6.91 2.74L12 24l-3.09-12.26L2 9l6.91-2.74L12 0z',
        strengths: ['Multimodal Analysis', 'Research & Facts', 'Google Integration'],
        useCases: ['Image analysis', 'Research tasks', 'Data processing']
    },
    {
        id: 'claude',
        name: 'Claude',
        company: 'Anthropic',
        url: 'https://claude.ai/',
        info_url: 'https://www.anthropic.com/claude',
        color: 'orange',
        icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
        strengths: ['Long-form Analysis', 'Ethical Reasoning', 'Creative Tasks'],
        useCases: ['Document analysis', 'Complex reasoning', 'Creative projects']
    },
    {
        id: 'qwen',
        name: 'Qwen',
        company: 'Alibaba',
        url: 'https://chat.qwen.ai/ ',
        info_url: 'https://www.alibabacloud.com/help/en/model-studio/what-is-qwen-llm#be17eb2b54ofk',
        color: 'purple',
        icon: 'M12 2L1 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-11-5z',
        strengths: ['Multilingual Support', 'Asian Languages', 'Cultural Context'],
        useCases: ['Translation', 'Cross-cultural communication', 'Asian market research']
    },
    {
        id: 'deepseek',
        name: 'DeepSeek',
        company: 'DeepSeek AI',
        url: 'https://chat.deepseek.com/',
        info_url: 'https://martinfowler.com/articles/deepseek-papers.html',
        color: 'indigo',
        icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
        strengths: ['Code Generation', 'Mathematical Reasoning', 'Open Source'],
        useCases: ['Programming assistance', 'Algorithm development', 'Technical research']
    },
    {
        id: 'grok',
        name: 'Grok',
        company: 'xAI',
        url: 'https://x.ai/',
        info_url: 'https://help.x.com/en/using-x/about-grok',
        color: 'gray',
        icon: 'M12 2l3.09 6.26L22 9l-6.91 2.74L12 24l-3.09-12.26L2 9l6.91-2.74L12 0z',
        strengths: ['Real-time Information', 'Social Media Context', 'Conversational AI'],
        useCases: ['Current events', 'Social trends', 'Real-time analysis']
    },
    {
        id: 'glm',
        name: 'GLM-4.5',
        company: 'Zhipu AI',
        url: 'https://chat.z.ai/',
        info_url: 'https://medium.com/@ferreradaniel/glm-4-5-the-ai-powerhouse-shaking-up-open-source-in-2025-602f7f4d961d',
        color: 'teal',
        icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
        strengths: ['Chinese Language', 'Multimodal Capabilities', 'Research Tasks'],
        useCases: ['Chinese NLP', 'Academic research', 'Multimodal analysis']
    },
    {
        id: 'kimi',
        name: 'Kimi K2',
        company: 'Moonshot AI',
        url: 'https://kimi.moonshot.cn/',
        info_url: 'https://moonshotai.github.io/Kimi-K2/',
        color: 'pink',
        icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3-.35 4.31-.99l-2.12-2.12c-.74.3-1.54.48-2.38.48-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6c0 .84-.18 1.64-.48 2.38l2.12 2.12C21.65 15 22 13.54 22 12c0-5.52-4.48-10-10-10z',
        strengths: ['Long Context Window', 'Document Processing', 'Memory Capabilities'],
        useCases: ['Document analysis', 'Long conversations', 'Research synthesis']
    },
    {
        id: 'longcat',
        name: 'LongCat',
        company: 'Meituan',
        url: 'https://longcat.chat/',
        info_url: 'https://huggingface.co/meituan-longcat/LongCat-Flash-Chat',
        color: 'yellow',
        icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3-.35 4.31-.99l-2.12-2.12c-.74.3-1.54.48-2.38.48-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6c0 .84-.18 1.64-.48 2.38l2.12 2.12C21.65 15 22 13.54 22 12c0-5.52-4.48-10-10-10z',
        strengths: ['Long Context Window', 'Document Processing', 'Fast'],
        useCases: ['Document analysis', 'Long conversations', 'Research synthesis']
    }
];
// Sample Patch Notes Data (You can update this with real data)
const patchNotes = [
    {
        id: 1,
        date: '2024-06-10',
        title: 'ChatGPT o1 Preview Released',
        description: 'OpenAI released a preview of the o1 model series, featuring advanced reasoning capabilities.',
        modelId: 'chatgpt',
        link: 'https://openai.com/index/introducing-openai-o1-preview/'
    },
    {
        id: 2,
        date: '2024-05-15',
        title: 'Gemini 1.5 Pro Context Window Increased',
        description: 'Google increased the context window for Gemini 1.5 Pro to 2 million tokens.',
        modelId: 'gemini',
        link: 'https://ai.google.dev/gemini-api/docs/models/gemini'
    },
    {
        id: 3,
        date: '2024-04-22',
        title: 'Claude 3.5 Sonnet Launched',
        description: 'Anthropic launched Claude 3.5 Sonnet, surpassing previous models in benchmarks.',
        modelId: 'claude',
        link: 'https://www.anthropic.com/news/claude-3-5-sonnet'
    },
    {
        id: 4,
        date: '2024-03-18',
        title: 'DeepSeek Coder V2 Released',
        description: 'DeepSeek introduced DeepSeek Coder V2, a powerful coding model with 236B parameters.',
        modelId: 'deepseek',
        link: 'https://coder.deepseek.com/'
    },
    {
        id: 5,
        date: '2024-02-29',
        title: 'Qwen1.5 Series Launched',
        description: 'Alibaba released the Qwen1.5 series with improved reasoning and multilingual capabilities.',
        modelId: 'qwen',
        link: 'https://qwenlm.github.io/blog/qwen1.5/'
    }
    // Add more notes as needed

];

