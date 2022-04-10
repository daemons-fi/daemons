import { assert, expect } from 'chai';
import { ethers, utils } from 'ethers';
import itParam from 'mocha-param';
import { ComparisonType, IPriceCondition } from '@daemons-fi/shared-definitions';
import { IPriceConditionForm } from '../../../components/new-script-page/blocks/conditions/conditions-interfaces';
import { ZeroAddress } from '../../../data/chain-info';
import { PriceConditionFactory } from '../price-condition-factory';
import { Token } from '../../../data/chains-data/interfaces';


describe('Price Condition Factory', () => {

    const tokens: Token[] = [
        {
            name: 'FooToken',
            symbol: 'FOO',
            address: '0x123',
            logoURI: '',
            decimals: 18,
        }
    ];

    it('creates an empty condition', async () => {
        const empty = PriceConditionFactory.empty();

        expect(empty.enabled).to.be.false;
        expect(empty.value.toNumber()).to.be.equal(0);
        expect(empty.token).to.be.equal(ZeroAddress);
        expect(empty.comparison).to.be.equal(0);
    });

    it('returns an empty condition when trying to build from undefined json', async () => {
        const condition = PriceConditionFactory.fromJson();

        assert.deepEqual(condition, PriceConditionFactory.empty());
    });

    it('restores condition from json object', async () => {
        const originalCondition: IPriceCondition = {
            enabled: true,
            token: '0x123',
            comparison: ComparisonType.GreaterThan,
            value: ethers.utils.parseEther('1.255'),
        };
        const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
        const condition = PriceConditionFactory.fromJson(jsonCondition);

        assert.deepEqual(condition, originalCondition);
    });

    it('returns an empty condition when trying to build from disabled form', async () => {
        const form: IPriceConditionForm = {
            enabled: false,
            valid: true,
            tokenAddress: tokens[0].address,
            comparison: ComparisonType.GreaterThan,
            floatValue: 125.554,
        };
        const condition = PriceConditionFactory.fromForm(form, tokens);

        assert.deepEqual(condition, PriceConditionFactory.empty());
    });

    it('throws error if form is enabled but not valid', async () => {
        const form: IPriceConditionForm = {
            enabled: true,
            valid: false,
            tokenAddress: tokens[0].address,
            comparison: ComparisonType.GreaterThan,
            floatValue: 125.554,
        };

        const gonnaThrow = () => PriceConditionFactory.fromForm(form, tokens);
        expect(gonnaThrow).to.throw('Cannot build Price condition from invalid form');
    });

    describe('creates a condition from an enabled form', () => {
        const form: IPriceConditionForm = {
            enabled: true,
            valid: true,
            tokenAddress: tokens[0].address,
            comparison: ComparisonType.GreaterThan,
            floatValue: 125.554,
        };

        it('happy flow', async () => {
            const condition = PriceConditionFactory.fromForm(form, tokens);

            expect(condition.enabled).to.be.true;
            expect(condition.comparison).to.be.equal(ComparisonType.GreaterThan);
            expect(condition.token).to.be.equal(tokens[0].address);
            expect(condition.value.toHexString()).to.be.equal(ethers.utils.parseEther('125.554').toHexString());
        });

        itParam(
            'condition value depends on token decimals: ${value}',
            [18, 9, 6],
            async (decimals: number) => {
                const newTokens: Token[] = [
                    {
                        name: 'FooToken',
                        symbol: 'FOO',
                        address: '0x123',
                        logoURI: '',
                        decimals: decimals,
                    }
                ];

                const condition = PriceConditionFactory.fromForm(form, newTokens);

                const expectedAmount = utils.parseUnits(form.floatValue.toString(), decimals);
                expect(condition.value.toHexString()).to.be.equal(expectedAmount.toHexString());
            });
    });
});
