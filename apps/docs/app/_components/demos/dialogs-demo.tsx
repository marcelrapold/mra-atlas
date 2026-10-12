'use client'

import { useState } from 'react'

import { Button } from '@rapold/framework-core'
import {
  ConfirmDialogProvider,
  useConfirm,
  useInform,
  usePrompt,
} from '@rapold/framework-core'
import { ErrorBoundary } from '@rapold/framework-core'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@rapold/framework-core'

function ConfirmDialogExamples() {
  const confirm = useConfirm()
  const prompt = usePrompt()
  const inform = useInform()
  const [status, setStatus] = useState('Noch keine Entscheidung getroffen.')

  return (
    <>
      <div className="demo-row">
        <Button
          variant="destructive"
          onClick={async () => {
            const ok = await confirm({
              title: 'Projekt löschen?',
              message: 'Das Projekt «Kundenportal» und alle Entwürfe werden entfernt.\nDies kann nicht rückgängig gemacht werden.',
              confirmLabel: 'Endgültig löschen',
              tone: 'destructive',
            })
            setStatus(ok ? 'Projekt gelöscht.' : 'Löschen abgebrochen.')
          }}
        >
          Projekt löschen
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const name = await prompt({
              title: 'Ansicht umbenennen',
              message: 'Wie soll die gespeicherte Ansicht heissen?',
              inputLabel: 'Name der Ansicht',
              defaultValue: 'Offene Pendenzen',
              required: true,
            })
            setStatus(name === null ? 'Umbenennen abgebrochen.' : `Ansicht heisst jetzt «${name}».`)
          }}
        >
          Ansicht umbenennen
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await inform('Die Freigabe wurde an die Projektleitung gesendet. Sie erhalten eine Nachricht, sobald entschieden ist.')
            setStatus('Hinweis bestätigt.')
          }}
        >
          Freigabe senden
        </Button>
      </div>
      <p role="status" aria-live="polite">
        {status}
      </p>
    </>
  )
}

function FailingWidget({ fail }: { fail: boolean }) {
  if (fail) throw new Error('Kennzahlen konnten nicht berechnet werden.')
  return <p>Umsatz Q3: CHF 1,24 Mio. (+8 % gegenüber Vorjahr)</p>
}

export function DialogsDemo() {
  const [fail, setFail] = useState(false)

  return (
    <ConfirmDialogProvider>
      <section className="demo-panel">
        <h2>ConfirmDialog</h2>
        <p>
          Bestätigen, Eingabe und Hinweis als Promise. Bei Bestätigungen liegt der Fokus zuerst auf
          «Abbrechen», bei Eingaben im Feld.
        </p>
        <ConfirmDialogExamples />
        <pre>
          <code>{`import { ConfirmDialogProvider, useConfirm } from '@rapold/framework-core'

// einmal im Layout
<ConfirmDialogProvider>{children}</ConfirmDialogProvider>

// in einer Komponente
const confirm = useConfirm()
if (await confirm({ message: 'Projekt löschen?', tone: 'destructive' })) {
  await deleteProject()
}`}</code>
        </pre>
      </section>

      <section className="demo-panel">
        <h2>Sheet mit Wischen zum Schliessen</h2>
        <p>
          Auf Touch-Geräten zeigt das untere Sheet einen Griff und lässt sich nach unten wegwischen.
          Escape und die Schliessen-Schaltfläche funktionieren weiterhin.
        </p>
        <div className="demo-row">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Filter öffnen</Button>
            </SheetTrigger>
            <SheetContent side="bottom" closeLabel="Filter schliessen" className="max-h-[85dvh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter</SheetTitle>
                <SheetDescription>Nach unten wischen schliesst das Panel.</SheetDescription>
              </SheetHeader>
              <div className="grid gap-3 px-4">
                <label className="grid gap-1 text-sm">
                  Suchbegriff
                  <input
                    className="h-11 rounded-md border border-input bg-transparent px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    placeholder="z. B. Zürich"
                  />
                </label>
                <p className="text-sm text-muted-foreground" data-no-swipe-dismiss>
                  Bereiche mit data-no-swipe-dismiss starten keine Wischgeste.
                </p>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button>Filter anwenden</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        <pre>
          <code>{`import { Sheet, SheetContent, SheetTrigger } from '@rapold/framework-core'

<Sheet>
  <SheetTrigger asChild><Button>Filter öffnen</Button></SheetTrigger>
  <SheetContent side="bottom" swipeToClose closeLabel="Filter schliessen">
    …
  </SheetContent>
</Sheet>

// eigenes Element: useSwipeToDismiss(element, { enabled, onDismiss })`}</code>
        </pre>
      </section>

      <section className="demo-panel">
        <h2>ErrorBoundary</h2>
        <p>Fängt Renderfehler eines Bereichs ab, statt die ganze Seite zu verlieren.</p>
        <div className="demo-row">
          <Button variant="outline" onClick={() => setFail(true)} disabled={fail}>
            Fehler auslösen
          </Button>
        </div>
        <ErrorBoundary scope="kennzahlen" onReset={() => setFail(false)}>
          <FailingWidget fail={fail} />
        </ErrorBoundary>
        <pre>
          <code>{`import { ErrorBoundary } from '@rapold/framework-core'

<ErrorBoundary scope="kennzahlen" resetKey={pathname} onError={(error) => log(error)}>
  <Kennzahlen />
</ErrorBoundary>`}</code>
        </pre>
      </section>
    </ConfirmDialogProvider>
  )
}
