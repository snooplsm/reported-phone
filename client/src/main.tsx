import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.tsx'
import { ApolloProvider } from '@apollo/client'
import { client } from "./ApolloClient"
import { Reports } from './Reports.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
    <Router>
        <Routes>
          <Route path="/" element={<App/>} />
          <Route path="/reports/:neighborhoods/:complaints?" element={<Reports/>}/>
        </Routes>
    </Router>  
    </ApolloProvider>
  </StrictMode>,
)
