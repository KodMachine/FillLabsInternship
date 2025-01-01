import DetailView from '../../../components/DetailView';

interface DetailPageProps {
  params: {
    operation: string;
  };
}

export default function DetailPage({ params }: DetailPageProps) {
  return <DetailView operation={params.operation} />;
}
