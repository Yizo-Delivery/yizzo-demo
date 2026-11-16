import { DemoLayout } from '@/components/DemoLayout';
import { DemoProvider } from '@/demo/DemoProvider';

export default function Home() {
  return (
    <DemoProvider>
      <DemoLayout />
    </DemoProvider>
  );
}
