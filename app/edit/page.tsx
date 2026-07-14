import { EditorShell } from '@/components/EditorShell';
import { PRESETS } from '@/lib/presets';

interface EditPageProps {
  searchParams: Promise<{ preset?: string }>;
}

export default async function EditPage({ searchParams }: EditPageProps) {
  const params = await searchParams;
  const isValidPreset =
    params.preset === 'empty' || PRESETS.some((p) => p.id === params.preset);
  const presetId = isValidPreset ? params.preset : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <EditorShell initialPresetId={presetId} />
    </div>
  );
}
