import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ArticleList from './components/ArticleList'
import ArticleDetail from './components/ArticleDetail'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">BeyondChats Articles</h1>
            <p className="mt-2 text-gray-600">Browse original and enhanced articles</p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<ArticleList />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

