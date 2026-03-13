import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

export default function ThreeColumnLayout({
  children,
  username,
}: {
  children: React.ReactNode
  username: string
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050507' }}>

      <LeftSidebar username={username} />

      {/* Centro — margen para los dos sidebars fijos */}
      <main
        className="min-h-screen overflow-y-auto"
        style={{
          marginLeft: '260px',
          marginRight: '300px',
        }}
      >
        {children}
      </main>

      <RightSidebar />

    </div>
  )
}