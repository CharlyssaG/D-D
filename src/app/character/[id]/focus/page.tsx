'use client';

import { useParams } from 'next/navigation';
import FocusMode from '@/components/FocusMode';

export default function FocusModePage() {
  const params = useParams();
  return <FocusMode characterId={params.id as string} />;
}
