# Blockchain / Web3 Engineer — Niche, Volatile, Lucrative

Web3 wo career hai jisme tu 2021 mein hero tha, 2022 mein zero, 2023 mein "kya kar raha hai bhai," aur 2024-26 mein wapas hero. Cycle hai — but cycle ke beech mein bhi koi 100% off-cycle nahi hota agar tu **engineering side** pe ho, "trader / influencer" side pe nahi. India mein Polygon (Sandeep Nailwal + Jaynti Kanani ka unicorn, Bharat ka pehla legit Web3 deca-unicorn — $10B+ peak valuation), CoinDCX (Sumit Gupta — RBI-friendly exchange), WazirX (Nischal Shetty — 2024 mein $230M ka hack zhela jo Indian crypto history ka largest), Alephium (Indian co-founders, novel BlockFlow consensus), Nazara Web3 (gaming + NFT), aur Reliance Jio Web3 division — sab actively hire kar rahe hain. Salary band? Fresher Solidity dev **12-30 LPA**, mid-career (3-7 yrs) **25-60 LPA**, Senior smart contract auditor (Trail of Bits / Code4rena top 10) **80 LPA - 1.5 Cr** ICs.

Pakdo, but caveat saaf samjho: yeh **cyclical** field hai. 2022 mein Terra-Luna crash hua, FTX collapse hua, OpenSea ne 80% staff cut kar diye. 2023 mein "crypto winter" — koi hire hi nahi kar raha tha. 2024 ETF approvals + Bitcoin ATH ke baad recovery shuru. 2026 mein Indian regulatory clarity (DPDP Act + crypto framework draft) ke baad market re-open ho raha hai. Toh yeh career tab choose kar jab tu **dual-skill** rakhna chahta hai — Web3 + ek mainstream backend (Node / Go / Rust). Pure-play Web3 mein lock hone se job security questionable rehti hai bear market mein.

> **Reader profile:** 3rd/4th year engineering student ya 1-3 yr SDE jo blockchain mein curious hai. Tu DSA + ek backend language (JS / Python / Go) jaanta hai, basic crypto (hashing, public-key) ka concept clear hai, aur HTTP / REST mein comfort hai. Solidity ya EVM ka prior knowledge zero hone se chalega — yahin se shuru karenge.

Metamask install kar le, Ganache spin up kar, chalte hain.

---

## 1. Why Blockchain / Web3 — and the volatility caveat

### 1.1 The Indian Web3 hiring landscape — actual companies

Pehle saaf kar dein — "Web3 jobs in India" ka matlab sirf "crypto exchange" nahi hai. Multiple verticals hain:

| Vertical | Companies | Hiring profile |
|----------|-----------|----------------|
| L1 / L2 protocols | Polygon, Alephium, Avail (Polygon spinoff) | Solidity / Rust / Go protocol engineers |
| Centralized exchanges (CEX) | CoinDCX, WazirX, Bitbns, Coinbase India, ZebPay | Backend (Java / Go) + matching engine + KYC |
| Wallets / infra | Biconomy (account abstraction), Persistence, Lens India teams | Solidity + frontend dApp |
| Web3 gaming | Nazara Web3, Loco Web3, Kratos Studios | Solidity + Unity / Unreal integration |
| DeFi protocols (global, India teams) | Aave India, Compound, Uniswap (small India presence), 1inch | Senior Solidity, formal verification |
| Audit firms | QuillAudits (Bangalore-based), Halborn India, ChainSecurity | Smart contract auditors |
| Enterprise blockchain | Reliance Jio Web3, TCS Quartz, Infosys Finacle Connect | Hyperledger Fabric / Corda — different stack |

Salary bands (2025-26 hiring data, Glassdoor + back-channels):

| Experience | Band | Typical role |
|------------|------|--------------|
| Fresher (campus) | 12-22 LPA | Solidity dev at Polygon / CoinDCX / Biconomy |
| Fresher (off-campus, GitHub portfolio + 1 deployed contract on mainnet) | 18-30 LPA | Same + DeFi protocols |
| 1-3 yrs | 25-45 LPA | Senior smart contract dev, dApp engineer |
| 3-7 yrs | 35-60 LPA | Lead protocol engineer, security researcher |
| Auditor (Code4rena top-100) | 60 LPA - 2 Cr | Independent contests + retainers |

### 1.2 The volatility — boom-bust history every Web3 dev must know

Yeh history isliye padh, taaki tu 2027 mein "crypto winter" aaye toh shocked na ho:

- **2017 ICO mania** — har project token launch karke $50M raise kar raha tha. 95% rugpull / vapor.
- **2018-19 winter** — BTC $20k → $3k. Half the projects shut down.
- **2020-21 DeFi summer + NFT mania** — Uniswap, Aave, OpenSea explode. Polygon scales 10x. Jobs everywhere.
- **2022 Terra-Luna + FTX collapse** — $40B Luna wipeout May 2022, FTX bankruptcy Nov 2022. 60% Web3 jobs evaporate.
- **2023 winter** — most boring year. Builders build, traders cry.
- **2024 ETF + halving** — Spot Bitcoin ETFs approved Jan 2024, BTC ATH ~$73k. Recovery starts.
- **2024 WazirX hack** — July 2024, $230M stolen via multi-sig compromise. Indian exchange compliance gets stricter.
- **2025-26** — Stablecoin + RWA (Real World Assets) tokenization wave; Polygon AggLayer; institutional adoption.

### 1.3 When to choose this career

Choose Web3 if:
- Tu **distributed systems** + **applied cryptography** dono mein curious hai (yeh genuine intellectual hook hai)
- Tu **dual-skill** maintain karne ko ready hai (Solidity + Node / Rust + Go) — taaki bear market mein pivot kar sake
- Tu **public portfolio** mein invest karega — GitHub, deployed mainnet contracts, audit contest writeups, Code4rena profile

Don't choose Web3 if:
- Tu sirf "salary high hai" ke liye aa raha hai — bear market mein 6 mahine without offers normal hai
- Tu pure scam-coin trading mindset rakhta hai — engineering side serious hai, "lambo" memes nahi

Khaas baat — Polygon, Biconomy, Alephium jaisi Indian Web3 cos **global-first** hire karti hain. Tu Bangalore mein baith ke Berlin / NYC team ke saath kaam karega. Remote-first, USD-pegged contracts (or India INR with onshore band). Yeh "service co" mindset chhod ke "product engineer" mindset adopt karne ka best opportunity hai.

---

## 2. Blockchain fundamentals

### 2.1 Hash functions — the cryptographic primitive everything stands on

Blockchain ka pura kuch ek hash function `H(x)` pe khada hai. Properties chahiye:

- **Deterministic** — same input → same output, always
- **Pre-image resistant** — given `H(x)`, computationally infeasible to find `x`
- **Collision resistant** — infeasible to find `x1 ≠ x2` such that `H(x1) = H(x2)`
- **Avalanche** — ek bit input change → ~50% output bits change

Bitcoin uses **SHA-256** (256-bit output). Ethereum uses **Keccak-256** (slight variant of SHA-3).

```python
import hashlib
print(hashlib.sha256(b"hello").hexdigest())
# 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824

print(hashlib.sha256(b"hellp").hexdigest())  # one bit flipped
# d62e6b03d24cd1c8f5da42b0fe3a5c30efa4f7f3a4cb99c0d3d7e7c... (totally different)
```

### 2.2 Merkle trees — the fingerprint of a transaction set

Block mein 1000 transactions hain. Tu pure block ka hash store kar de? Possible — but agar koi sirf 1 transaction verify karna chahta hai, pure block download karna padega. Solution — **Merkle tree**.

```
            Root (this goes in block header)
           /    \
        H12      H34
        / \      / \
      H1  H2   H3  H4
      |   |    |   |
      Tx1 Tx2  Tx3 Tx4
```

Light client (mobile wallet) sirf root + Merkle proof (~log N hashes) maang ke verify kar leta hai ki "Tx2 is in this block" — without downloading Tx1, Tx3, Tx4. Yeh **SPV (Simplified Payment Verification)** ka basis hai.

### 2.3 Distributed ledger consensus — PoW vs PoS

Problem statement: 1000 nodes globally, no central server, koi propose kare ki "next block yeh hai" — sab agree kaise karein? Yeh **Byzantine Generals Problem** hai. Two dominant solutions:

- **Proof of Work (PoW)** — Bitcoin, Ethereum pre-Sept 2022. Miners compute SHA-256 hashes until `H(block + nonce) < target`. Energy-expensive but Sybil-resistant (CPU cost = vote).
- **Proof of Stake (PoS)** — Ethereum post-Merge (Sept 2022), Polygon, Solana, Avalanche. Validators stake ETH (32 ETH on Ethereum), randomly chosen to propose blocks; misbehaviour → stake **slashed**.

Comparison:

| Property | PoW | PoS |
|----------|-----|-----|
| Energy | High (Bitcoin ~150 TWh/yr) | Low (Ethereum 99.95% reduction post-Merge) |
| Hardware | ASICs | Validator + 32 ETH |
| Finality | Probabilistic (6 confirmations ~1hr) | Deterministic (~12 min on Ethereum) |
| 51% attack cost | Hash power | Stake (visible on-chain, can be slashed) |

### 2.4 Block + transaction structure (Ethereum)

Ek Ethereum block header mein roughly:

```
parentHash       (32 bytes — link to previous block)
stateRoot        (32 bytes — Merkle root of all account states)
transactionsRoot (32 bytes — Merkle root of all txs in this block)
receiptsRoot     (32 bytes — Merkle root of tx receipts)
number           (block height)
timestamp
baseFeePerGas    (post-EIP-1559)
```

A transaction (post EIP-1559):

```
nonce            (sender's tx counter)
maxPriorityFee   (tip to validator)
maxFeePerGas     (cap on baseFee + tip)
gasLimit         (max gas this tx can burn)
to               (20 bytes — recipient)
value            (wei to send)
data             (calldata for contract calls)
v, r, s          (ECDSA signature)
```

### 2.5 Why "trustless" doesn't mean "no trust"

Marketing speak mein "trustless" ka matlab "tujhe centralized party trust nahi karna padega" — but you're trusting:

- **The protocol designers** (Vitalik et al — kya consensus rules sound hain?)
- **The client implementations** (Geth, Erigon, Reth — kya bug-free hain? 2010 mein Bitcoin overflow bug 184B BTC mint ho gaye the)
- **Validator economic incentives** (kya 33%+ validators colluded toh chain halt ho jayegi?)
- **Oracles** (price feeds — Chainlink, Pyth — kya sahi data de rahe hain?)
- **The smart contract code itself** (sabse bada attack surface — Section 7 dekh)

"Trustless" = trust shifted from one party to many, not eliminated. Senior interviews mein yeh nuance maango.

---

## 3. Ethereum + EVM

### 3.1 EVM as a state machine

Ethereum ek **deterministic state machine** hai. State `S` ke saath ek transaction `T` apply karte ho, naya state `S'` mil jaata hai:

```
S' = STF(S, T)      // STF = State Transition Function
```

State kya hai? Ek mapping `address → AccountState`. AccountState mein:

```
nonce        (tx counter for EOAs, contract creation count for contracts)
balance      (wei)
storageRoot  (Merkle Patricia Trie root of contract storage — only for contracts)
codeHash     (Keccak-256 of contract bytecode — only for contracts)
```

Sab nodes globally yeh STF chalate hain — same input → same output → same final state. Consensus state pe hota hai, not just on transaction ordering.

### 3.2 Accounts — EOA vs contract

Two types of accounts:

| Type | EOA (Externally Owned Account) | Contract Account |
|------|-------------------------------|------------------|
| Controlled by | Private key | Code (deployed bytecode) |
| Can initiate tx? | Yes | No (only respond) |
| Has code? | No | Yes |
| Address derived from | `keccak256(pubkey)[12:]` | `keccak256(rlp(creator, nonce))[12:]` (CREATE) or `keccak256(0xff, creator, salt, code_hash)[12:]` (CREATE2) |

Note: post EIP-7702 (Pectra upgrade, May 2025), EOAs can temporarily delegate to contract code — paving the way for native account abstraction. Important interview topic for 2026.

### 3.3 Gas — and EIP-1559

Gas = computational resource unit. Har EVM opcode ka fixed gas cost hai:

- `ADD` = 3 gas
- `MUL` = 5 gas
- `SSTORE` (write storage) = 20,000 gas (cold) / 5,000 gas (warm) — sabse mehenga
- `SLOAD` (read storage) = 2,100 gas (cold) / 100 gas (warm)
- `CALL` (external call) = 2,600 gas (cold) / 100 gas (warm)

Pre-EIP-1559 (legacy): user `gasPrice` set karta tha; auction → highest bid wins block space. Predatory + UX disaster.

Post-EIP-1559 (London upgrade, Aug 2021):

```
total_fee_per_gas = baseFeePerGas + min(maxPriorityFee, maxFeePerGas - baseFee)
```

- `baseFee` — protocol-determined, **burned** (not paid to validator). Adjusts ±12.5% per block based on block fullness (target = 50% of gas limit = 15M).
- `maxPriorityFee` — tip, paid to validator.
- `maxFeePerGas` — cap. If `baseFee > maxFeePerGas`, tx waits in mempool.

Burning baseFee = ETH supply gets deflationary in busy periods. Yeh "ultrasound money" thesis ka mechanical foundation hai.

### 3.4 Storage / memory / calldata — the three data locations

Solidity teen jagah data rakh sakta hai:

| Location | Cost | Persistence | Use |
|----------|------|-------------|-----|
| `storage` | Highest (20k gas/SSTORE cold) | Permanent on-chain | Contract state vars |
| `memory` | Medium (3 gas/word) | Per-call only | Function locals (large) |
| `calldata` | Cheapest | Read-only, per-call | External function params |

Rule of thumb — `external` function pe array params `calldata` mein le, `memory` mein nahi (saves gas):

```solidity
// EXPENSIVE
function process(uint[] memory data) external { ... }

// CHEAP
function process(uint[] calldata data) external { ... }
```

### 3.5 Transaction lifecycle — mermaid

```mermaid
sequenceDiagram
    participant User as User Wallet (Metamask)
    participant Node as RPC Node (Infura/Alchemy)
    participant Mempool as Mempool
    participant Builder as Block Builder
    participant Validator as Validator (PoS)
    participant Chain as Chain State

    User->>User: Sign tx with private key (ECDSA)
    User->>Node: eth_sendRawTransaction(signed_tx)
    Node->>Node: Validate (nonce, signature, gas, balance)
    Node->>Mempool: Gossip tx to peer mempools
    Mempool->>Builder: Builder picks high-tip txs
    Builder->>Builder: Simulate + order (MEV optimization)
    Builder->>Validator: Submit block proposal
    Validator->>Chain: Attest + finalize after 2 epochs (~12.8 min)
    Chain-->>Node: Block included; tx receipt available
    Node-->>User: eth_getTransactionReceipt returns success
```

Yeh diagram interview mein draw kar de — senior interviewer impressed ho jaata hai because most candidates "user → blockchain → done" bolte hain. Mempool, builder/proposer separation (post-Merge), MEV, finality vs inclusion — yeh nuance senior level hai.

---

## 4. Solidity essentials

### 4.1 Contract structure — the anatomy

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    // State variables (storage — expensive!)
    uint256 public count;
    address public owner;

    // Events (logs — cheap, indexed by clients)
    event Incremented(address indexed by, uint256 newCount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Functions
    function increment() external {
        count += 1;
        emit Incremented(msg.sender, count);
    }

    function reset() external onlyOwner {
        count = 0;
    }
}
```

Yeh 25 lines mein har Solidity primitive hai — state, event, modifier, constructor, function. Read karke har keyword internalize kar.

### 4.2 Visibility modifiers

```solidity
function publicFn()   public   { /* callable internally + externally */ }
function externalFn() external { /* only callable externally (via tx or other contract) */ }
function internalFn() internal { /* only callable internally + by inheriting contracts */ }
function privateFn()  private  { /* only callable within this contract */ }
```

Gas tip — agar function bahar se call hota hai aur params bade hain, `external` use kar (calldata cheap hai). `public` har case mein extra `memory` copy kar deta hai.

### 4.3 view / pure / payable

| Modifier | What it means | Gas |
|----------|--------------|-----|
| `view` | Reads state, doesn't modify | Free if called off-chain via `eth_call` |
| `pure` | Doesn't read or write state | Free if called off-chain |
| `payable` | Can receive ETH | — |
| (none) | Can read + write state | Costs gas |

```solidity
function getBalance() external view returns (uint256) {
    return address(this).balance;
}

function add(uint256 a, uint256 b) external pure returns (uint256) {
    return a + b;
}

function deposit() external payable {
    // msg.value automatically added to address(this).balance
}
```

### 4.4 Storage layout + gas

Solidity packs state vars into 32-byte slots **in declaration order**. Smaller types in same slot save gas:

```solidity
// EXPENSIVE — 3 slots (3 SSTOREs at deploy)
contract BadLayout {
    uint128 a;   // slot 0 (only first half used)
    uint256 b;   // slot 1
    uint128 c;   // slot 2 (only first half used)
}

// CHEAP — 2 slots (a + c packed)
contract GoodLayout {
    uint128 a;   // slot 0 (first half)
    uint128 c;   // slot 0 (second half — packed!)
    uint256 b;   // slot 1
}
```

Pro tip — `bool` is 8 bits, `address` is 160 bits, so `bool + address` packs into 1 slot. Layout-aware contracts can save 5-10% gas on deployment + ongoing operations.

### 4.5 Inheritance + interfaces

```solidity
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

abstract contract Ownable {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }
}

contract MyToken is Ownable, IERC20 {
    mapping(address => uint256) private _balances;

    function transfer(address to, uint256 amount) external override returns (bool) {
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        return true;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }
}
```

Solidity has **C3 linearization** for multiple inheritance (like Python). Diamond problem? `super.foo()` calls next in MRO chain. Diamond standard (EIP-2535) exists for upgradable contracts via delegatecall.

### 4.6 Worked example — a 60-line ERC-20 token

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract NerdToken {
    string public name = "Nerd Token";
    string public symbol = "NERD";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10 ** decimals;
        _balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner_, address spender) external view returns (uint256) {
        return _allowances[owner_][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = _allowances[from][msg.sender];
        require(allowed >= amount, "ERC20: insufficient allowance");
        unchecked {
            _allowances[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "ERC20: transfer to zero address");
        require(_balances[from] >= amount, "ERC20: transfer exceeds balance");
        unchecked {
            _balances[from] -= amount;
            _balances[to] += amount;
        }
        emit Transfer(from, to, amount);
    }
}
```

Yeh real, deployable ERC-20 hai. Note: `unchecked` blocks Solidity 0.8.0+ ke built-in overflow checks bypass karte hain — gas saving, kyunki upar `require` ne already check kar liya.

Production mein yeh khud likhne ki zaroorat nahi — `import "@openzeppelin/contracts/token/ERC20/ERC20.sol";` use kar. OpenZeppelin audited, battle-tested. But interview mein "ERC-20 from scratch likh" demand aata hai — yeh template tujhe ratta nahi karna padega, samjh ke likhne aana chahiye.

---

## 5. Hardhat + Foundry tooling

### 5.1 Hardhat — JS-native, mature, reliable

Hardhat is the default Solidity dev environment. JS / TS, npm-based, plugin ecosystem rich. Local node (`hardhat node`), test runner (Mocha + Chai), deploy scripts, network forking.

```bash
npm init -y
npm install --save-dev hardhat
npx hardhat init   # choose "TypeScript project"
```

`hardhat.config.ts`:

```ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC!,
      accounts: [process.env.PRIVATE_KEY!],
    },
    polygon: {
      url: process.env.POLYGON_RPC!,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY!,
  },
};

export default config;
```

Test (`test/NerdToken.ts`):

```ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NerdToken", function () {
  it("should mint initial supply to deployer", async function () {
    const [deployer] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("NerdToken");
    const token = await Token.deploy(1000000n);
    expect(await token.balanceOf(deployer.address)).to.equal(
      1000000n * 10n ** 18n
    );
  });

  it("should transfer tokens", async function () {
    const [alice, bob] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("NerdToken");
    const token = await Token.deploy(1000n);
    await token.connect(alice).transfer(bob.address, 100n * 10n ** 18n);
    expect(await token.balanceOf(bob.address)).to.equal(100n * 10n ** 18n);
  });
});
```

Run:

```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network sepolia
```

### 5.2 Foundry — Rust-based, fast, idiomatic

Foundry is the new wave (Paradigm-funded). Tests written in **Solidity itself** (no JS context-switch), 10-100x faster than Hardhat for big test suites, fuzz testing built-in, invariant testing.

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge init my-project
```

Test (`test/NerdToken.t.sol`):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/NerdToken.sol";

contract NerdTokenTest is Test {
    NerdToken token;
    address alice = address(0x1);
    address bob   = address(0x2);

    function setUp() public {
        vm.prank(alice);
        token = new NerdToken(1000);
    }

    function test_InitialSupplyToDeployer() public {
        assertEq(token.balanceOf(alice), 1000 * 10 ** 18);
    }

    function testFuzz_Transfer(uint256 amount) public {
        amount = bound(amount, 0, 1000 * 10 ** 18);
        vm.prank(alice);
        token.transfer(bob, amount);
        assertEq(token.balanceOf(bob), amount);
    }
}
```

`testFuzz_*` functions Foundry automatically 256+ random inputs ke saath run karta hai — reentrancy / overflow edge cases catch karne ke liye god-tier.

### 5.3 Ganache (legacy local node)

Ganache (Truffle Suite) was the og local Ethereum node. Hardhat / Anvil (Foundry's local node) ne replace kar diya, but legacy projects still use it. CLI: `ganache --port 8545`. Don't start new projects on Ganache in 2026.

### 5.4 When each wins

| Use case | Tool |
|----------|------|
| Quick prototype, JS-heavy team | Hardhat |
| Large protocol, perf-critical tests, fuzz/invariant heavy | Foundry |
| Mainnet fork testing | Both (Hardhat `forking`, Foundry `--fork-url`) |
| Production audits | Foundry (auditors prefer it now) |

Modern stack 2026 — Foundry for tests + deployment, Hardhat for scripts/integration with TS frontend. Polyglot is normal.

### 5.5 Worked example — deploy via Hardhat

`scripts/deploy.ts`:

```ts
import { ethers } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("NerdToken");
  const token = await Token.deploy(1_000_000n); // 1M initial supply
  await token.waitForDeployment();
  const addr = await token.getAddress();
  console.log("NerdToken deployed at:", addr);

  // Wait for 5 confirmations before verifying
  await token.deploymentTransaction()?.wait(5);

  console.log("Verifying on Etherscan...");
  // verify via hardhat-etherscan plugin
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat verify --network sepolia <contract-address> 1000000
```

---

## 6. DeFi primitives

### 6.1 Token standards — ERC-20, ERC-721, ERC-1155

| Standard | Use | Key methods |
|----------|-----|-------------|
| ERC-20 | Fungible tokens (USDC, DAI, WETH) | `transfer`, `approve`, `transferFrom`, `balanceOf` |
| ERC-721 | Non-fungible tokens (NFTs — art, identity) | `ownerOf(tokenId)`, `safeTransferFrom`, `approve(tokenId)` |
| ERC-1155 | Multi-token (gaming items — both fungible + non-fungible in one contract) | `balanceOf(account, id)`, `safeBatchTransferFrom` |

ERC-721 typical:

```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721URIStorage.sol";

contract NerdNFT is ERC721URIStorage {
    uint256 private _nextTokenId;

    constructor() ERC721("NerdNFT", "NRD") {}

    function mint(address to, string memory uri) external returns (uint256) {
        uint256 id = _nextTokenId++;
        _mint(to, id);
        _setTokenURI(id, uri);  // typically IPFS link to JSON metadata
        return id;
    }
}
```

### 6.2 AMM — Uniswap V2 constant product `x * y = k`

Traditional exchange = order book. AMM (Automated Market Maker) = liquidity pool with formula. Uniswap V2's invariant:

```
x * y = k
```

`x` = reserve of token A, `y` = reserve of token B, `k` = constant. When trade happens, `k` stays roughly the same (minus fees).

Example: pool has 1000 ETH + 3,000,000 USDC (so price = 3000 USDC/ETH). Trader wants to swap 10 ETH for USDC.

```
new_x = 1000 + 10 = 1010 ETH
k = 1000 * 3,000,000 = 3,000,000,000
new_y = k / new_x = 3,000,000,000 / 1010 ≈ 2,970,297 USDC
USDC out = 3,000,000 - 2,970,297 = 29,703 USDC
effective price = 29,703 / 10 = 2970.3 USDC/ETH (slight slippage)
```

Trader paid 2970.3 instead of 3000 — that's **slippage**, function of trade size relative to pool depth.

### 6.3 Lending — Aave / Compound

Money markets work on **interest rate models** — variable rates based on **utilization**:

```
utilization = totalBorrows / totalSupply
```

If utilization > kink (typically 80%), rates spike steeply. This balances supply/demand on-chain. Lenders deposit USDC, borrowers post ETH as collateral, system maintains **collateralization ratio** (e.g. 150% — borrow $1000 against $1500 ETH). Below threshold → **liquidation**: anyone can repay borrower's debt and seize collateral at 5-10% discount.

### 6.4 Staking + LP rewards

- **Staking** — lock token to earn rewards (PoS validator, or protocol-level "stake LDO, earn fees").
- **LP rewards / yield farming** — provide liquidity to pool, earn (1) trading fees, (2) protocol token emissions.
- **Impermanent loss** — when pool prices diverge from initial, LP gets less than just-holding. Critical concept; junior devs often forget.

---

## 7. Smart contract security

### 7.1 Reentrancy — the DAO hack 2016

**The bug** — contract sends ETH to user *before* updating internal state. The user is a malicious contract, and its `receive()` re-enters the original function before state updates.

Vulnerable:

```solidity
// VULNERABLE — DAO-style reentrancy
contract VulnerableBank {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "no balance");
        // EXTERNAL CALL BEFORE STATE UPDATE — DEADLY
        (bool ok, ) = msg.sender.call{value: bal}("");
        require(ok, "transfer failed");
        balances[msg.sender] = 0;  // updated AFTER call — too late
    }
}
```

Attacker contract:

```solidity
contract Attacker {
    VulnerableBank target;
    constructor(address _t) { target = VulnerableBank(_t); }

    function attack() external payable {
        target.deposit{value: 1 ether}();
        target.withdraw();  // triggers receive() → re-enters withdraw()
    }

    receive() external payable {
        if (address(target).balance >= 1 ether) {
            target.withdraw();  // drain loop
        }
    }
}
```

Fixed — **Checks-Effects-Interactions** pattern:

```solidity
// FIXED
function withdraw() external {
    uint256 bal = balances[msg.sender];
    require(bal > 0, "no balance");
    balances[msg.sender] = 0;             // EFFECTS first
    (bool ok, ) = msg.sender.call{value: bal}("");  // INTERACTION last
    require(ok, "transfer failed");
}
```

Even better — use OpenZeppelin's `ReentrancyGuard`:

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SafeBank is ReentrancyGuard {
    function withdraw() external nonReentrant {
        // ...
    }
}
```

DAO 2016 — $60M ETH drained, led to Ethereum hard fork → Ethereum (ETH) + Ethereum Classic (ETC) split. Foundational story.

### 7.2 Integer overflow — pre 0.8.0 SafeMath, post 0.8.0 built-in

Pre-0.8.0 — `uint256 x = type(uint256).max + 1` silently wrapped to 0. Attackers exploited this in early DeFi. Solution was `SafeMath` library: `x.add(y)` reverts on overflow.

Solidity 0.8.0+ (Dec 2020): all arithmetic checked by default. `SafeMath` legacy — only needed if you opt into `unchecked { }` blocks for gas optimization (carefully).

### 7.3 Oracle manipulation

If your contract reads "price of ETH" from a single Uniswap pool, attacker can flash-loan, distort the pool, your contract reads bad price, attacker drains. Famous: **bZx 2020** ($350k), **Mango Markets 2022** ($110M).

Defense — use **Chainlink oracles** (TWAPs from multiple sources, off-chain aggregation, on-chain delivery), or Uniswap V3 TWAPs (hard to manipulate over multiple blocks).

### 7.4 Front-running + MEV

Mempool public hota hai — anyone with a faster connection can see your tx before it lands in a block. **MEV (Maximum Extractable Value)** = profit extracted by reordering / inserting / censoring txs in a block.

Patterns:
- **Sandwich attack** — bot sees your DEX swap, front-runs with buy, lets you swap (price moves up), back-runs with sell.
- **Liquidation MEV** — bots race to liquidate undercollateralized loans for the discount.
- **Generalized front-running** — bots scan mempool, simulate, copy-paste profitable txs with higher gas.

Defenses — **Flashbots / MEV-Boost / private mempools** (e.g. Cowswap, MEV Blocker), **commit-reveal schemes**.

### 7.5 Access control bugs

```solidity
// VULNERABLE — anyone can become owner
function initialize(address _owner) external {
    owner = _owner;  // no check if already initialized!
}
```

Parity multisig 2017 — `kill` function was unprotected; user `devops199` accidentally invoked it, freezing $300M ETH permanently.

Fix — use OpenZeppelin's `Initializable` + `onlyOwner`:

```solidity
function initialize(address _owner) external initializer {
    owner = _owner;
}
```

### 7.6 Recommended audits + bug bounty platforms

| Firm / platform | Speciality | Tier |
|-----------------|-----------|------|
| Trail of Bits | Formal verification, deep audits | Top tier ($50-200k per audit) |
| OpenZeppelin | DeFi protocol audits | Top tier |
| ChainSecurity | Formal methods (ETH client teams use) | Top tier |
| QuillAudits | Indian firm, mid-tier projects | Mid tier |
| Code4rena | Crowdsourced audit contests | Auditors compete for prize pool |
| Sherlock | Audit + insurance hybrid | New model |
| Immunefi | Bug bounty platform ($1M+ bounties common) | — |

For freshers — Code4rena contests are gold. You can compete from day 1, learn from public reports, and top-50 finishers get cash + recruiter attention. Indian engineers in Code4rena top-100 routinely book $200k-500k/yr in contest earnings.

---

## 8. Layer 2 + scaling

Ethereum L1 ka throughput ~15 TPS hai. Visa = 24,000 TPS. Solution — **L2s** that batch many txs off-chain and post compressed proof to L1.

### 8.1 Polygon — Indian unicorn, multi-product

Polygon (formerly Matic Network) — Sandeep Nailwal + Jaynti Kanani + Anurag Arjun (all ex-IIT/IIIT Indians, Bangalore-based originally). Started 2017, now $5-10B valuation, deca-unicorn.

Products:
- **Polygon PoS** — sidechain (not strictly an L2; security model is its own validator set, ~100 validators staked MATIC/POL). Most popular: ~3M daily txs, $1.5B TVL. Used by Reddit (collectibles), Starbucks Odyssey (pre-2024), Nike RTFKT, Disney.
- **Polygon zkEVM** — full zero-knowledge rollup, EVM-equivalent. Inherits Ethereum security via validity proofs.
- **Polygon CDK + AggLayer** — toolkit to launch your own zkEVM L2 (sovereign chain), connected via AggLayer for cross-chain liquidity.

### 8.2 Optimistic rollups — Optimism + Arbitrum

Concept — execute txs off-chain, post compressed batch to L1, assume valid by default. **Challenge period** (7 days) during which anyone can submit a fraud proof. If valid fraud proof → batch reverted, attacker slashed.

- **Optimism** — OP stack (used by Base, Worldcoin, Mode), EVM-equivalent.
- **Arbitrum** — Nitro (Geth fork), highest L2 TVL in 2026.

Trade-off — fast execution + cheap gas, but 7-day withdrawal delay (or pay liquidity provider for instant exit).

### 8.3 ZK rollups — zkSync, Scroll, Polygon zkEVM, Linea

Concept — execute txs off-chain, generate **validity proof** (SNARK or STARK) that batch is correct, post proof + state diff to L1. L1 verifies proof in milliseconds. Withdrawal in ~1 hr (vs 7 days optimistic).

| Rollup | Proof system | EVM-equivalence |
|--------|-------------|-----------------|
| zkSync Era | PLONK-based | "Type 4" — Solidity compiles to custom VM |
| Polygon zkEVM | STARK + SNARK | "Type 3" — bytecode-level mostly equivalent |
| Scroll | Halo2-based | "Type 2" — fully bytecode-compatible |
| Linea (Consensys) | Vortex SNARK | Type 2 |

Trade-off — proving is computationally expensive; proof generation can lag. ZK research is hot area for compensation — Indian engineers at Scroll, Polygon Labs ZK team are getting USD 200k+ packages.

### 8.4 When L2 makes sense

Use L2 when:
- Tx volume > 10/min and gas > $5/tx becomes user-hostile
- Use case has clear "sovereign app" feel (gaming, social, NFT mint)
- You're OK with smart contract bridge risk (most L2 hacks happen at the bridge — Ronin $625M, Wormhole $325M)

Don't use L2 when:
- TVL < $1M and you're not solving a real congestion problem
- You need maximum decentralization (L1 still > L2 on validator count)

---

## 9. Frontend dApp development

### 9.1 ethers.js / viem — contract calls

Two main libraries:
- **ethers.js v6** — mature, large ecosystem, used by everyone since 2018.
- **viem** — newer (2023, Wagmi team), TypeScript-first, tree-shakeable, faster.

ethers v6 example:

```ts
import { ethers } from "ethers";
import abi from "./NerdToken.json";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer   = await provider.getSigner();
const contract = new ethers.Contract("0xTokenAddress", abi, signer);

// Read (no gas)
const balance: bigint = await contract.balanceOf(await signer.getAddress());
console.log("Balance:", ethers.formatUnits(balance, 18));

// Write (costs gas, opens wallet popup)
const tx = await contract.transfer("0xRecipient", ethers.parseUnits("10", 18));
const receipt = await tx.wait();
console.log("Confirmed in block:", receipt?.blockNumber);
```

viem example:

```ts
import { createPublicClient, createWalletClient, custom, http, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { abi } from "./NerdToken.abi";

const publicClient = createPublicClient({ chain: mainnet, transport: http() });
const walletClient = createWalletClient({ chain: mainnet, transport: custom(window.ethereum) });

const [address] = await walletClient.getAddresses();
const balance = await publicClient.readContract({
  address: "0xTokenAddress",
  abi,
  functionName: "balanceOf",
  args: [address],
});

const hash = await walletClient.writeContract({
  address: "0xTokenAddress",
  abi,
  functionName: "transfer",
  args: ["0xRecipient", parseUnits("10", 18)],
  account: address,
});
```

### 9.2 WalletConnect / RainbowKit / wagmi — connecting wallets

- **wagmi** — React hooks for Ethereum (`useAccount`, `useReadContract`, `useWriteContract`).
- **RainbowKit** — beautiful pre-built wallet connection UI (Metamask, WalletConnect, Coinbase Wallet, etc).
- **WalletConnect v2** — protocol for connecting mobile wallets to dApps via QR.

```tsx
import { WagmiProvider } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function App() {
  return (
    <WagmiProvider config={config}>
      <ConnectButton />
      {/* rest of dApp */}
    </WagmiProvider>
  );
}
```

### 9.3 Reading state vs sending txs

| Operation | Gas | Speed | Wallet popup |
|-----------|-----|-------|-------------|
| `eth_call` (read) | Free | Instant | No |
| `eth_estimateGas` (simulate) | Free | Instant | No |
| `eth_sendTransaction` (write) | Yes | ~12 sec on mainnet | Yes |

Pattern — read everything you can off-chain (free + instant); only ask user to sign for writes.

---

## 10. Indian regulatory landscape

### 10.1 30% tax + 1% TDS

India's crypto tax (Finance Act 2022, applied April 2022):
- **30% flat tax** on gains from "Virtual Digital Assets" (VDAs) — no offsetting losses against other heads.
- **1% TDS** on every transfer above ₹10,000 (₹50,000 for "specified persons") — applied at exchange / counter-party level.
- **No deductions** allowed except cost of acquisition.

Effect — Indian volume dropped ~70% after July 2022 (TDS effective date). Liquidity migrated to international exchanges (Binance, Bybit, OKX). Indian exchanges (CoinDCX, WazirX) market share collapsed.

### 10.2 WazirX hack (July 2024) + compliance

July 18, 2024 — WazirX multi-sig wallet ($230M) compromised. Liminal Custody (custodian) and WazirX both blamed; root cause appears to be malicious tx signed by 3-of-6 Liminal signers under social engineering. Largest Indian crypto hack ever.

Aftermath:
- WazirX moratorium on withdrawals → "socialized loss" proposal (55% return) → Singapore court restructuring.
- FIU-IND (Financial Intelligence Unit) registration mandatory for all VASPs (Virtual Asset Service Providers) since March 2023; stricter enforcement post-WazirX.
- Indian Web3 startups now hire dedicated **compliance + treasury** ICs at 25-40 LPA — if you're in CA/finance + Web3, this niche is wide open.

### 10.3 Why Indian Web3 companies build globally first

Tax + regulatory uncertainty pushes Indian Web3 cos to:
- Incorporate in Singapore / Cayman / Switzerland (SAFT structures, foundation models)
- Token-launch on global LPs (Coinbase, Binance) before Indian exchanges
- Target US/EU users primarily; India = secondary market

Implication for engineers — the work is global, the team is global, but the office may be in Bangalore. INR salary or USD-denominated contractor agreement, both common.

---

## 11. Top 30 Blockchain / Web3 interview questions

| # | Question | What's tested |
|---|----------|---------------|
| 1 | Difference between PoW and PoS? Cite 1 attack each | Consensus fundamentals |
| 2 | Walk through a tx lifecycle from Metamask to finality | Architecture |
| 3 | EOA vs contract account — list 3 differences | Account model |
| 4 | Explain EIP-1559 base fee + tip; what gets burned? | Fee model |
| 5 | What is a Merkle tree, how does SPV use it? | Crypto primitive |
| 6 | Explain calldata vs memory vs storage with gas costs | EVM internals |
| 7 | Write a vulnerable + fixed reentrancy contract on the whiteboard | Security |
| 8 | Why was DAO hack possible; what changed afterwards? | Security history |
| 9 | Explain Uniswap V2's `x*y=k` invariant + slippage | DeFi math |
| 10 | What is impermanent loss? Derive it for 2x price move | DeFi math |
| 11 | Difference between ERC-721 and ERC-1155? | Token standards |
| 12 | Explain Optimistic vs ZK rollup trade-offs | L2 |
| 13 | What is the 7-day challenge period in Optimism? | L2 |
| 14 | Walk through Polygon PoS architecture | L2 / Indian context |
| 15 | What is MEV? Name 3 patterns | Mempool / MEV |
| 16 | Explain CREATE vs CREATE2; why use CREATE2? | Contract deployment |
| 17 | What does `delegatecall` do? Cite Parity bug | Security history |
| 18 | Write an ERC-20 from scratch (10 min) | Solidity |
| 19 | How would you upgrade a deployed contract? | Proxy patterns |
| 20 | Explain transparent proxy vs UUPS | Upgradability |
| 21 | What is a flash loan? How is it abused? | DeFi attacks |
| 22 | Explain Chainlink oracle architecture | Oracles |
| 23 | What gas optimizations would you apply to a hot function? | Gas |
| 24 | Difference between events and storage; when use which? | EVM |
| 25 | What is ERC-4337 account abstraction? | Modern Ethereum |
| 26 | Explain EIP-7702 (Pectra) and what changes for EOAs | Modern Ethereum |
| 27 | How do ZK-SNARKs verify computation without re-running it? | ZK |
| 28 | India's 30% + 1% TDS — implications for protocol design? | Regulatory |
| 29 | How would you architect a decentralized exchange MVP? | System design |
| 30 | Walk through the WazirX hack 2024 root cause | Security incident |

Pro tip — Q7 (reentrancy on whiteboard), Q9 (Uniswap math), Q18 (ERC-20 from scratch), Q26 (EIP-7702) — yeh chaar pe deep hona, baaki articulate kar le, 80% interviews crack ho jayenge.

---

## 12. Pre-interview checklist

Walk-in ke 60 second pehle yeh mentally tick kar:

- [ ] Can I draw the tx lifecycle from Metamask to finality?
- [ ] Can I write a vulnerable + fixed reentrancy contract from memory?
- [ ] Do I know the Checks-Effects-Interactions pattern?
- [ ] Can I write an ERC-20 from scratch in 10 minutes?
- [ ] Can I derive impermanent loss for a 2x price move?
- [ ] Can I explain `x*y=k` and compute slippage on a 10% trade?
- [ ] Do I know the difference between Optimistic and ZK rollups?
- [ ] Can I explain `calldata` vs `memory` vs `storage` with gas numbers?
- [ ] Can I describe EIP-1559 base fee + tip + burn mechanism?
- [ ] Do I know the DAO hack 2016 + Parity bug 2017 root causes?
- [ ] Can I explain Polygon's PoS validator model?
- [ ] Have I deployed at least 1 contract to Sepolia or Polygon testnet?
- [ ] Have I written at least 5 unit tests in Hardhat or Foundry?
- [ ] Can I explain MEV with 2 examples (sandwich, liquidation)?
- [ ] Do I understand `delegatecall` and proxy patterns?
- [ ] Can I describe ERC-4337 account abstraction at a high level?
- [ ] Do I know the WazirX 2024 hack timeline and root cause?
- [ ] Have I read at least 3 Code4rena public audit reports?
- [ ] Do I have a verified contract on Etherscan I can show?
- [ ] Can I explain India's 30% + 1% TDS for VDAs?

If 15+ ticked, walk in confident. Web3 interviews narrative-driven hote hain — *kahan toot ta hai, kyu toot ta hai, fix kya hai* — yeh teen sawal har vulnerability + protocol pe ready honi chahiye. Plus tu ek deployed contract address Etherscan pe dikha de — interviewer ka mood instantly shift ho jaata hai "yeh banda real hai" wala.

---

## What to learn next

Web3 strong ho gaya — ab compounding effect ke liye yeh order follow kar:

- **`nodejs-backend`** — most dApps need a backend (indexer, KYC, off-chain data). Solidity + Node = full-stack Web3 engineer.
- **`devsecops-appsec`** — smart contract security + traditional AppSec ka overlap massive hai. Code4rena top-100 candidates almost always have AppSec background.
- **`cpp-mastery`** — if you want to go deep on protocol engineering (Geth/Reth uses Go/Rust, but the underlying cryptography papers are in C++/Rust). Plus Solana, Aptos, Sui — Rust ecosystem for L1s.
- **`system-design-advanced`** — designing exchange matching engines, decentralized order books, MEV-resistant DEX — these are senior interview rounds.
- **`networks-complete`** — P2P gossip protocols, libp2p, devp2p — how nodes find each other and propagate blocks.
- **`os-complete`** — geth tuning, validator hardware, hardware wallet (Ledger / Trezor) internals.
- **`monitoring-observability`** — on-chain monitoring (Tenderly, Forta), alerting on suspicious tx patterns.

Web3 is a *career inside a cycle*. The pattern that wins: keep a public profile (GitHub with deployed contracts, Etherscan verified contracts, Code4rena profile, 1 audit report or vulnerability disclosure), one mainnet contract, one DeFi or NFT side-project, one talk at India Web3 / ETHIndia / Devfolio meetup. Bear market mein bhi Polygon, Biconomy, Alephium types invariably hire kar rahe hote hain — but unko visible portfolio chahiye.

Bas itna kar — aur 2026 mein 12-30 LPA fresher band tujhe na sirf clear, balki Code4rena contests ke side income se *augment* karne layak ban chukega. Web3 waale `nai` nahi bolte agar tu mainnet deploy kar chuka hai — aur tu un mein se ek hai ab.
