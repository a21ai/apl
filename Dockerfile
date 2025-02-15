# Start from official Rust image
FROM ghcr.io/arch-network/rust-with-solana:latest

# Set working directory
WORKDIR /archway-turbo

RUN rustup default stable

# Install Node.js and yarn
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs && \
    npm install -g yarn

# Copy application code

COPY . .
RUN yarn install
RUN yarn turbo build

# Optional: Uncomment if you need to preserve specific artifacts
# COPY --from=build /archway-turbo/target/deploy/*.so /app/target/deploy/
# COPY --from=build /archway-turbo/packages/ /app/packages/
# COPY --from=build /archway-turbo/apps/ /app/apps/ 