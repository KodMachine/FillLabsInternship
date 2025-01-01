import DetailView from '../../../../components/DetailView';

interface DetailPageProps {
  params: {
    operation: string;
    id?: string;
  };
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { operation, id } = params;

  return <DetailView operation={operation} id={id} />;
}
