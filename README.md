# near2ts

Effortlessly create TypeScript types for your NEAR smart contracts.

Within the NEAR ecosystem, the ABI is depicted as a JSON schema outlining the contract's interface. Utilizing this library enables you to quickly generate TypeScript types by simply providing the contract name or the path to the ABI, streamlining your development process.


## Example
Generate the types for the devhub.near contract and add them to your root
```bash
npx near2ts devhub.near
```

or

```bash
npx near2ts ./devhub.near_abi.json
```

Use the type ContractCallArgs to be able to accept arguments for any of the methods or reference the specific type for each call (in this case AddLike)

```typescript
import { AddLike, ContractCallArgs } from "./contract_types";

interface AddLikeCall {
    contractId: 'devhub.near',
    methodName: 'add_like',
    args: AddLike
}

const contractCall: AddLikeCall = {
    contractId: 'devhub.near',
    methodName: 'add_like',
    args: {post_id: 20}
}

const receipt = await account.functionCall(contractCall)
```


```typescript
interface DevHubContractCall {
    contractId: 'devhub.near',
    methodName: string,
    args: ContractCallArgs
}

const contractCall: DevHubContractCall = {
    contractId: 'devhub.near',
    methodName: 'add_member',
    args: {
        ....
    }
}
````

You can also install it as a dev dependency for you project

```

npm i near2ts --save-dev

```

Then add the script to your package.json and run it!

package.json

```
  "scripts": {
    "near2ts": "near2ts"
  },

```

```
npm run near2ts ./abi.json
```


## Generating ABI
| Warning: This only works for contracts that have generated ABI's |
| --- |

Generate an ABI by following these instructions, for more info checkout [near/abi](https://github.com/near/abi/tree/main)
### Rust
Ensure you have cargo-near installed

To generate an ABI for a contract within the directory containing contract's Cargo.toml
```bash
$ cargo near abi
```
Ensure that the project you are generating an ABI for depends on a version of near-sdk of 4.1.0 or later and has the abi feature enabled.

```bash
near-sdk = { version = "4.1.0", features = ["abi"] }
```

### TypeScript
Ensure you have a near-sdk-js (version 0.7.0 or later) contract

To generate an ABI for a contract within the directory containing contract's package.json

```bash
$ npx near-sdk-js build --generateABI path/to/contract.ts
```

The ABI will be put in build/contract-abi.json

TODO
- dev dependency uses local version before node modules so if you have near cli js installed its using that one instead of rs, making it fail

