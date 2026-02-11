import { aboutMetadata } from './metadata'

export { aboutMetadata as metadata }

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
