import SwiftUI

struct ContentView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        NavigationStack(path: Bindable(appState).navigationPath) {
            SessionListView()
                .navigationDestination(for: Session.self) { session in
                    ChatView(session: session)
                }
        }
    }
}

#Preview {
    ContentView()
        .environment(AppState())
        .preferredColorScheme(.dark)
}
