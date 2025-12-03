import { useState } from 'react'

function App() {
    const [isReady, setIsReady] = useState(false)

    const handleStartApplication = () => {
        setIsReady(true)
        console.log('Application started')
    }

    return (
        <div
            id="mainApplicationContainer"
            className="w-full h-screen bg-neutral-900 text-white flex flex-col items-center justify-center"
        >
            <h1 className="text-4xl font-bold mb-4">
                Nebulosa Audio Visualizer
            </h1>

            <button
                onClick={handleStartApplication}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-full font-semibold transition-colors cursor-pointer"
            >
                {isReady ? 'System Ready' : 'Initialize App'}
            </button>
        </div>
    )
}

export default App