// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "GitHubMobile",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "GitHubMobile",
            targets: ["GitHubMobile"]
        )
    ],
    targets: [
        .target(
            name: "GitHubMobile",
            path: "Sources"
        )
    ]
)
