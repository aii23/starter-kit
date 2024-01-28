import {
    RuntimeModule,
    runtimeModule,
    state,
    runtimeMethod,
} from '@proto-kit/module';
import { State, StateMap, assert } from '@proto-kit/protocol';
import { Field, Provable, PublicKey, Struct, UInt64 } from 'o1js';

interface BalancesConfig {
    totalSupply: UInt64;
}

@runtimeModule()
export class Balances extends RuntimeModule<BalancesConfig> {
    @state() public balances = StateMap.from<PublicKey, UInt64>(
        PublicKey,
        UInt64
    );

    @state() public circulatingSupply = State.from<UInt64>(UInt64);

    @runtimeMethod()
    public addBalance(address: PublicKey, amount: UInt64): void {
        const circulatingSupply = this.circulatingSupply.get();
        const newCirculatingSupply = circulatingSupply.value.add(amount);
        assert(
            newCirculatingSupply.lessThanOrEqual(this.config.totalSupply),
            'Circulating supply would be higher than total supply'
        );
        this.circulatingSupply.set(newCirculatingSupply);
        const currentBalance = this.balances.get(address);
        const newBalance = currentBalance.value.add(amount);
        this.balances.set(address, newBalance);

        console.log(
            `Account: ${address.toBase58()}. Prev balance: ${currentBalance.value.toString()}. New Balance: ${newBalance.toString()}`
        );
    }

    @runtimeMethod()
    public transferFrom(from: PublicKey, to: PublicKey, amount: UInt64): void {
        console.log(`Transfer from: ${from.toBase58()} to ${to.toBase58()}`);
        let currentBalance = this.balances.get(from).orElse(UInt64.from(0));
        console.log(
            `From balance: ${this.balances.get(from).value.toString()}`
        );
        console.log(`From balance: ${currentBalance.toString()}`);
        currentBalance.assertGreaterThan(amount);

        let addrCurrentBalance = this.balances.get(to).orElse(UInt64.from(0));

        this.balances.set(from, currentBalance.sub(amount));
        this.balances.set(to, addrCurrentBalance.add(amount));
    }
}
