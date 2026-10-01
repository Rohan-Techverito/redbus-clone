import { Route as RouterRoute, Routes } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import SearchResultsPage from './pages/SearchResultsPage'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <RouterRoute path="/" element={<HomePage />} />
        <RouterRoute path="/search" element={<SearchResultsPage />} />
      </Routes>
    </>
  )
}

export default App
