import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Global Configuration & Helpers ---
const API_BASE_URL = 'http://localhost:8081/api';

// IMPORTANT: Paste your Google AI API Key here.
// Get your free key from https://aistudio.google.com/
const GEMINI_API_KEY = 'AIzaSyD20hZhA4KcNoxJ1SWWU2uCwF9t80gnf_E';

/**
 * A simple utility to parse the JWT and extract its payload without validation.
 */
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

// --- SVG Icons ---
const LoadingSpinner = ({ className }) => ( <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> );
const SearchIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg> );
const EditIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg> );
const DeleteIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> );
const AiSparkleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 12l-2.293 2.293a1 1 0 01-1.414 0L4 12l2.293-2.293a1 1 0 011.414 0L10 12zm0 0l2.293 2.293a1 1 0 010 1.414L10 18l-2.293-2.293a1 1 0 01-1.414 0L4 13.414l2.293-2.293a1 1 0 011.414 0L10 12zm10 5l-2.293-2.293a1 1 0 00-1.414 0L14 17l2.293 2.293a1 1 0 001.414 0L20 17l-2.293-2.293a1 1 0 00-1.414 0L14 17z" /></svg> );
const SwapIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> );

// --- UI Components ---

const Notification = ({ message, type, onClear }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(onClear, 3500);
            return () => clearTimeout(timer);
        }
    }, [message, onClear]);
    if (!message) return null;
    const styles = { success: 'bg-lime-500', error: 'bg-red-500' };
    return (
        <div className={`fixed z-50 bottom-5 right-5 p-4 rounded-lg shadow-2xl text-white text-sm font-bold transition-all duration-300 transform ${message ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${styles[type]}`}>
            {message}
        </div>
    );
};

const AuthForm = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const clearNotification = useCallback(() => setNotification({ message: '', type: 'success' }), []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        clearNotification();
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const payload = isLogin ? { username, password } : { name, username, password };
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Authentication failed.');
            onAuthSuccess(data.token, data.name);
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleToggleMode = (modeIsLogin) => {
        setIsLogin(modeIsLogin);
        setName('');
    };
    return (
        <>
            <Notification message={notification.message} type={notification.type} onClear={clearNotification} />
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-auto">
                <div className="flex border-b border-gray-700 mb-6">
                    <button onClick={() => handleToggleMode(true)} className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none ${isLogin ? 'text-lime-400 border-b-2 border-lime-400' : 'text-gray-400'}`}>Login</button>
                    <button onClick={() => handleToggleMode(false)} className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none ${!isLogin ? 'text-lime-400 border-b-2 border-lime-400' : 'text-gray-400'}`}>Register</button>
                </div>
                <h2 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-4xl font-bold text-center text-white mb-2">{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
                <p className="text-center text-gray-400 mb-8 text-sm">{isLogin ? 'Enter your credentials.' : 'Create an account.'}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (<input type="text" placeholder="Display Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition" />)}
                    <input type="text" placeholder="Username (for login)" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition" />
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-lg font-bold text-gray-900 bg-lime-400 hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-lime-400 disabled:bg-lime-400/50 transition-colors">
                        {isLoading ? <LoadingSpinner className="text-gray-900" /> : (isLogin ? 'Login' : 'Create Account')}
                    </button>
                </form>
            </div>
        </>
    );
};

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in-up">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-2xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><CloseIcon /></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const SlangForm = ({ token, onFormSubmit, initialData = null, onCancel, setNotification }) => {
    const [term, setTerm] = useState('');
    const [meaning, setMeaning] = useState('');
    const [example, setExample] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = initialData !== null;
    useEffect(() => {
        if (isEditing) {
            setTerm(initialData.term);
            setMeaning(initialData.meaning);
            setExample(initialData.example);
        } else {
            setTerm('');
            setMeaning('');
            setExample('');
        }
    }, [initialData, isEditing]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const slangData = { term, meaning, example };
        const endpoint = isEditing ? `/slangs/${initialData.id}` : '/slangs';
        const method = isEditing ? 'PUT' : 'POST';
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(slangData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || `Failed to ${isEditing ? 'update' : 'create'} slang.`);
            onFormSubmit(result);
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Term" value={term} onChange={(e) => setTerm(e.target.value)} required className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition" />
            <textarea placeholder="Meaning" value={meaning} onChange={(e) => setMeaning(e.target.value)} required rows="3" className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition" />
            <input type="text" placeholder="Example Sentence" value={example} onChange={(e) => setExample(e.target.value)} required className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition" />
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-5 py-2 flex items-center justify-center font-semibold text-gray-900 bg-lime-400 rounded-lg hover:bg-lime-300 disabled:bg-lime-400/50 transition-colors">
                    {isLoading ? <LoadingSpinner className="text-gray-900" /> : (isEditing ? 'Save Changes' : 'Add Slang')}
                </button>
            </div>
        </form>
    );
};

const SlangCard = ({ slang, currentUserId, onEdit, onDelete }) => {
    const isOwner = slang.authorId === currentUserId;
    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-lime-400/50 hover:-translate-y-1.5 transition-all duration-300 ease-in-out group relative">
            <div className="flex justify-between items-start">
                <h3 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-2xl font-bold text-lime-400 tracking-tight group-hover:text-lime-300 transition-colors pr-20">{slang.term}</h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">Community</span>
            </div>
            <p className="text-gray-300 mt-2">{slang.meaning}</p>
            <p className="text-gray-500 italic text-sm mt-4">"{slang.example}"</p>
            {isOwner && (
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-2 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-full transition-colors"><EditIcon /></button>
                    <button onClick={onDelete} className="p-2 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-full transition-colors"><DeleteIcon /></button>
                </div>
            )}
        </div>
    );
};

const AiSlangCard = ({ slang }) => {
    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border-2 border-lime-500/30 hover:border-lime-500/60 hover:-translate-y-1.5 transition-all duration-300 ease-in-out group relative">
            <div className="flex justify-between items-start">
                <h3 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-2xl font-bold text-lime-400 tracking-tight group-hover:text-lime-300 transition-colors">{slang.term}</h3>
                <span className="flex items-center space-x-2 text-xs font-bold text-lime-300 bg-lime-900/50 px-2 py-1 rounded-full"><AiSparkleIcon /><span>AI Definition</span></span>
            </div>
            <p className="text-gray-300 mt-2">{slang.meaning}</p>
            <p className="text-gray-500 italic text-sm mt-4">"{slang.example}"</p>
        </div>
    );
};

const Translator = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isSlangToEnglish, setIsSlangToEnglish] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const handleTranslate = async () => {
        if (!inputText.trim() || !GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GOOGLE_AI_API_KEY') {
            setOutputText('Please enter text to translate and ensure your API key is set.');
            return;
        }
        setIsLoading(true);
        setOutputText('');
        const fromLang = isSlangToEnglish ? "modern internet slang" : "proper formal English";
        const toLang = isSlangToEnglish ? "proper formal English" : "modern internet slang";
        const prompt = `Translate the following text from ${fromLang} to ${toLang}. Provide only the translated text, without any additional commentary or labels:\n\n"${inputText}"`;
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (!response.ok) throw new Error("Translation request failed.");
            const data = await response.json();
            const translation = data.candidates[0].content.parts[0].text;
            setOutputText(translation.trim());
        } catch (error) {
            setOutputText("Sorry, an error occurred during translation.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto mb-16">
            <h2 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-3xl font-bold text-white mb-6 text-center">Slang Translator</h2>
            <div className="grid md:grid-cols-2 gap-4 items-center relative">
                <textarea placeholder={isSlangToEnglish ? "Enter slang..." : "Enter formal English..."} value={inputText} onChange={(e) => setInputText(e.target.value)} rows="4" className="w-full p-4 bg-gray-900 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition resize-none" />
                <div className="flex justify-center md:absolute md:left-1/2 md:-translate-x-1/2 my-2 md:my-0">
                    <button onClick={() => setIsSlangToEnglish(!isSlangToEnglish)} className="p-3 bg-gray-700 rounded-full text-lime-400 hover:bg-gray-600 transition-colors focus:outline-none ring-2 ring-transparent focus:ring-lime-400"><SwapIcon /></button>
                </div>
                <div className="w-full p-4 h-full min-h-[112px] bg-gray-900 text-gray-300 border-2 border-gray-700 rounded-lg">
                    {isLoading ? <LoadingSpinner className="text-lime-400 mx-auto mt-8" /> : outputText || (isSlangToEnglish ? "Translation to English appears here..." : "Translation to slang appears here...")}
                </div>
            </div>
            <button onClick={handleTranslate} disabled={isLoading} className="mt-6 w-full max-w-xs mx-auto flex justify-center py-3 px-4 rounded-lg font-bold text-gray-900 bg-lime-400 hover:bg-lime-300 disabled:bg-lime-400/50 transition-colors">
                {isLoading ? <LoadingSpinner className="text-gray-900" /> : 'Translate'}
            </button>
        </div>
    );
};

// --- Main Application Component ---
function App() {
    const [token, setToken] = useState(localStorage.getItem('zlang-token'));
    const [user, setUser] = useState(localStorage.getItem('zlang-user'));
    const [currentUserId, setCurrentUserId] = useState(null);
    const [slangs, setSlangs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedSlang, setSelectedSlang] = useState(null);
    const [aiSlang, setAiSlang] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    const clearNotification = useCallback(() => setNotification({ message: '', type: 'success' }), []);

    useEffect(() => {
        const storedToken = localStorage.getItem('zlang-token');
        if (storedToken) {
            const decodedToken = parseJwt(storedToken);
            setCurrentUserId(decodedToken?.userId || null);
        } else {
            setCurrentUserId(null);
        }
    }, [token]);

    const fetchSlangFromGemini = useCallback(async (term) => {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GOOGLE_AI_API_KEY') {
            console.warn("Gemini API key is not set. Skipping AI search.");
            return null;
        }
        const prompt = `You are a slang dictionary. Define the slang term "${term}". Provide a concise meaning and a creative, realistic example sentence. Format your response as a JSON object with three keys: "term", "meaning", and "example". Provide only the JSON object.`;
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (!response.ok) return null;
            const data = await response.json();
            const jsonText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
            return JSON.parse(jsonText);
        } catch (error) {
            console.error("Failed to fetch or parse Gemini response:", error);
            return null;
        }
    }, []);

    const fetchSlangs = useCallback(async (query) => {
        setSearchLoading(true);
        setAiSlang(null);
        const localSearchPromise = fetch(`${API_BASE_URL}/slangs/search?query=${encodeURIComponent(query)}`).then(res => res.ok ? res.json() : []).catch(() => []);
        const geminiSearchPromise = query.trim() ? fetchSlangFromGemini(query) : Promise.resolve(null);
        try {
            const [localResults, geminiResult] = await Promise.all([localSearchPromise, geminiSearchPromise]);
            setSlangs(localResults);
            if (geminiResult) setAiSlang(geminiResult);
        } catch (error) {
            setNotification({ message: 'An error occurred while searching.', type: 'error' });
        } finally {
            setSearchLoading(false);
        }
    }, [fetchSlangFromGemini]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSlangs(searchTerm || '');
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchSlangs]);

    const handleAuthSuccess = (newToken, name) => {
        localStorage.setItem('zlang-token', newToken);
        localStorage.setItem('zlang-user', name);
        setToken(newToken);
        setUser(name);
        const decodedToken = parseJwt(newToken);
        setCurrentUserId(decodedToken?.userId || null);
        setNotification({ message: `Welcome, ${name}!`, type: 'success' });
    };

    const handleLogout = () => {
        localStorage.removeItem('zlang-token');
        localStorage.removeItem('zlang-user');
        setToken(null);
        setUser(null);
        setCurrentUserId(null);
        setNotification({ message: 'You have been logged out.', type: 'success' });
    };

    const openModal = (mode, slang = null) => {
        setModalMode(mode);
        setSelectedSlang(slang);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSlang(null);
    };



    const handleFormSubmit = (updatedSlang) => {
        if (modalMode === 'add') {
            setSlangs(prev => [updatedSlang, ...prev]);
            setNotification({ message: 'Slang added successfully!', type: 'success' });
        } else {
            setSlangs(prev => prev.map(s => s.id === updatedSlang.id ? updatedSlang : s));
            setNotification({ message: 'Slang updated successfully!', type: 'success' });
        }
        closeModal();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedSlang) return;
        try {
            const response = await fetch(`${API_BASE_URL}/slangs/${selectedSlang.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete slang.');
            setSlangs(prev => prev.filter(s => s.id !== selectedSlang.id));
            setNotification({ message: 'Slang deleted successfully!', type: 'success' });
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        }
        closeModal();
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }} className="bg-gray-900 min-h-screen text-gray-200">
            <style>{` body { background-color: #111827; } ::placeholder { color: #6b7280; } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <Notification message={notification.message} type={notification.type} onClear={clearNotification} />
            <Modal isOpen={isModalOpen} onClose={closeModal} title={ modalMode === 'add' ? 'Add New Slang' : modalMode === 'edit' ? 'Edit Slang' : 'Confirm Deletion' }>
                {modalMode === 'add' || modalMode === 'edit' ? (
                    <SlangForm token={token} onFormSubmit={handleFormSubmit} initialData={selectedSlang} onCancel={closeModal} setNotification={setNotification} />
                ) : (
                    <div>
                        <p className="text-gray-300">Are you sure you want to delete the term <span className="font-bold text-white">"{selectedSlang?.term}"</span>? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button onClick={closeModal} className="px-5 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors">Yes, Delete</button>
                        </div>
                    </div>
                )}
            </Modal>

            <header className="bg-gray-900/70 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-20">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="text-3xl font-extrabold text-white tracking-wider">Z-Lang <span className="text-lime-400">.</span></div>
                    {user && ( <div className="flex items-center space-x-4"> <span className="hidden sm:block text-sm text-gray-400">Welcome, <span className="font-bold text-white">{user}</span></span> <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold text-lime-400 bg-lime-400/10 rounded-lg hover:bg-lime-400/20 transition-colors"> Logout </button> </div> )}
                </nav>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:px-8">
                {!token ? (
                    <div className="mt-12 sm:mt-16 text-center">
                         <h1 style={{fontFamily: 'Poppins, sans-serif'}} className="text-5xl md:text-7xl font-extrabold text-white leading-tight">Define Your <span className="text-lime-400">World.</span></h1>
                         <p className="max-w-xl mx-auto mt-4 text-gray-400">The definitive, community-driven dictionary for modern slang and internet culture.</p>
                         <div className="mt-12"><AuthForm onAuthSuccess={handleAuthSuccess} /></div>
                    </div>
                ) : (
                    <>
                        <div className="text-center mt-8 mb-12">
                            <h1 style={{fontFamily: 'Poppins, sans-serif'}} className="text-5xl md:text-6xl font-extrabold text-white leading-tight">Share Your Lingo</h1>
                            <p className="max-w-xl mx-auto mt-3 text-gray-400">Contribute to the culture. Add a new slang term the world needs to know.</p>
                            <button onClick={() => openModal('add')} className="mt-6 inline-block px-8 py-3 font-bold text-gray-900 bg-lime-400 rounded-lg hover:bg-lime-300 transition-colors shadow-lg shadow-lime-500/10">Add New Slang</button>
                        </div>
                        <Translator />
                    </>
                )}

                <div className="mt-16 w-full max-w-4xl mx-auto">
                     <div className="relative mb-8">
                        <input type="text" placeholder="Search for any slang..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-4 py-4 text-lg bg-gray-800 text-white border-2 border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition" />
                        <div className="absolute left-5 top-1/2 -translate-y-1/2">
                            {searchLoading ? <LoadingSpinner className="text-gray-500" /> : <SearchIcon className="h-6 w-6 text-gray-500" />}
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {aiSlang && <AiSlangCard slang={aiSlang} />}
                        {slangs.map(slang =>
                            <SlangCard
                                key={slang.id}
                                slang={slang}
                                currentUserId={currentUserId}
                                onEdit={() => openModal('edit', slang)}
                                onDelete={() => openModal('delete', slang)}
                            />
                        )}
                        {!searchLoading && !aiSlang && slangs.length === 0 && (
                             <div className="text-center text-gray-500 md:col-span-2 mt-8 py-10 bg-gray-800/50 rounded-2xl">
                                <p>{searchTerm ? 'No results found.' : 'Search for a term or add your own!'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;




