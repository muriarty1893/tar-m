import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';

/** For the demo's cards that have no screen yet (Tarlalarım, Tarla Haritası, all prices). */
export function SoonDialog({ title, onClose }: { title: string | null; onClose: () => void }) {
  return (
    <Dialog open={!!title} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="mx-4 rounded-[24px] border-border bg-background">
        <DialogHeader>
          <DialogTitle className="font-heading text-[22px]">{title}</DialogTitle>
          <DialogDescription className="text-[15px] leading-6 text-muted-foreground">
            Bu bölüm yakında geliyor. Şimdilik hastalık taramasını, hava durumunu ve tarım takvimini deneyebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onPress={onClose}>
            <Text>Tamam</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
