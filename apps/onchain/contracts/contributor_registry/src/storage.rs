use soroban_sdk::{contracttype, Address, String};

// TTL constants for Soroban storage rent management.
// LEDGER_THRESHOLD: if the remaining TTL falls below this value, extend it.
// LEDGER_BUMP: the new TTL to set when extending (≈30 days at 5 s/ledger).
pub const LEDGER_THRESHOLD: u32 = 100_000;
pub const LEDGER_BUMP: u32 = 518_400;

// ── Tier thresholds (reputation score) ───────────────────────
pub const TIER_SILVER_MIN: u64 = 50;
pub const TIER_GOLD_MIN: u64 = 200;
pub const TIER_PLATINUM_MIN: u64 = 500;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    // ── Existing keys (unchanged) ─────────────────────────────
    Admin,
    Contributor(Address),
    GitHubIndex(String),
    RegistrationNonce(Address),

    // ── Multisig keys ─────────────────────────────────────────
    MultisigConfig,
    Proposal(u64),
    NextProposalId,

    // ── Badge keys ────────────────────────────────────────────
    Badges(Address), // contributor -> Vec<Badge>
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContributorData {
    pub address: Address,
    pub github_handle: String,
    pub reputation_score: u64,
    pub registered_timestamp: u64,
}

/// Contributor tier derived from reputation score.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ContributorTier {
    Bronze,
    Silver,
    Gold,
    Platinum,
}

/// Badges that can be granted to contributors by multisig approval.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Badge {
    TopContributor,
    EarlyAdopter,
    BugHunter,
    Mentor,
}
