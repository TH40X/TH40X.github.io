import { Layout } from 'antd';
import { Content, Footer } from 'antd/es/layout/layout';
import {
  Route,
  HashRouter as Router,
  Routes
} from 'react-router-dom';

import { AppHeader } from './Header';
import glidersDataRaw from './glidersData.json';
import { IndexPage } from './pages';
import { GlidersComparePage } from './pages/compare';
import { FlightAnalysisPage } from './pages/flightAnalysis';
import { InfosPage } from './pages/infos';
import { CompetitionStatsPage } from './pages/competitionStats';


export interface GlidersDataIndex {
  [key: string]: GliderData;
}

export interface GliderHistory {
  date: string,
  text: string,
}

export interface competitionParticipation {
  year: number;
  value: number;
}

export interface GliderData {
  name: string;
  description?: string;
  isGlider?: boolean;
  history?: GliderHistory[];
  winRate?: number[];
  competitonParticipation?: competitionParticipation[];
  gliders?: GliderData[];
  polar?: number[][];
}

function App() {
  const glidersData: GlidersDataIndex = glidersDataRaw;

  return (
    <Router>
      <Layout className="layout">
        <AppHeader />

        <Content style={{ padding: '0 0px' }}>
          <Routes>
            <Route path="" element={<IndexPage />} />
            <Route path="/compare" element={<GlidersComparePage glidersData={glidersData} />} />
            <Route path="/infos" element={<InfosPage glidersData={glidersData} />} />
            <Route path="/flightAnalysis" element={<FlightAnalysisPage glidersData={glidersData} />} />
            <Route path="/competitonStats" element={<CompetitionStatsPage glidersData={glidersData} />} />
          </Routes>
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          Unified Glider Project ©2023
          <br />
          All rights reserved
          <br />
          Contact :
          <a href="mailto:unified.glider.project@gmail.com"> unified.glider.project@gmail.com</a>
        </Footer>
      </Layout>
    </Router>
  )
}

export default App;