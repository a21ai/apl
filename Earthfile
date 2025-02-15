VERSION 0.8

rustbase:
    FROM ghcr.io/arch-network/rust-with-solana:latest
    WORKDIR /archway-turbo

setup:
    FROM +rustbase
    ENV CARGO_INCREMENTAL=0
    

deps:
    FROM +setup

    # Clean up and install Node.js
    RUN rm -rf /var/cache/apt/archives/* && \
        rm -rf /var/lib/apt/lists/* && \
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
        apt-get install -y nodejs && \
        rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*

    # Install yarn and turbo
    RUN npm install -g yarn turbo

build:
    FROM +deps

    COPY . .
    
    # Install dependencies
    RUN yarn install --frozen-lockfile
    
    # Build everything using turbo
    RUN yarn turbo build
    
    # Save artifacts
    SAVE ARTIFACT programs/apl-sats/target/deploy/apl_sats.so AS LOCAL target/deploy/apl_sats.so
    SAVE ARTIFACT programs/apl-amm/target/deploy/apl_amm.so AS LOCAL target/deploy/apl_amm.so
    SAVE ARTIFACT packages/*/dist AS LOCAL packages/
    SAVE ARTIFACT apps/*/.next AS LOCAL apps/

test:
    FROM +build
    RUN yarn turbo test

lint:
    FROM +deps
    COPY . .
    RUN cargo fmt --all -- --check
    RUN cargo clippy --all-targets --all-features -- -D warnings

local:
    FROM +build 