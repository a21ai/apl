# Start from official Rust image
FROM rust:latest

# Set working directory
WORKDIR /archway-turbo

# Environment configuration
ENV CARGO_INCREMENTAL=0 \
    PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

# System dependencies and Rust components
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    debian-archive-keyring \
    sudo make build-essential clang pkg-config curl libssl-dev git jq && \
    rustup component add rustfmt && \
    rustup component add clippy && \
    rustup default stable && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Node.js and JS toolchain
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn turbo && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Solana CLI installation
#RUN curl --proto '=https' --tlsv1.2 -sSfL https://raw.githubusercontent.com/solana-developers/solana-install/main/install.sh | bash
RUN sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"


# Copy application code
COPY . .

# Build dependencies and application
RUN yarn install --frozen-lockfile && \
    yarn turbo build

# Optional: Uncomment if you need to preserve specific artifacts
# COPY --from=build /archway-turbo/target/deploy/*.so /app/target/deploy/
# COPY --from=build /archway-turbo/packages/ /app/packages/
# COPY --from=build /archway-turbo/apps/ /app/apps/ 