import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { ApplicationForm } from '@/components/ApplicationForm';
import { BatchUploader } from '@/components/BatchUploader';
import { ModelCard } from '@/components/ModelCard';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/apply" element={<ApplicationForm />} />
        <Route path="/batch" element={<BatchUploader />} />
        <Route path="/model" element={<ModelCard />} />
      </Routes>
    </Layout>
  );
}