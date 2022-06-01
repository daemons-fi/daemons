import { assert, expect } from "chai";
import { ethers, utils } from "ethers";
import itParam from "mocha-param";
import {
    ComparisonType,
    IBalanceCondition,
    IHealthFactorCondition
} from "@daemons-fi/shared-definitions";
import { ZeroAddress } from "../../../data/chain-info";
import { Token } from "../../../data/chains-data/interfaces";
import { ICurrentScript } from "../../i-current-script";
import { ScriptAction } from "../../../data/chains-data/action-form-interfaces";
import { HealthFactorConditionFactory } from "../health-factor-condition-factory";
import {
    IHealthFactorConditionForm,
    ScriptConditions
} from "../../../data/chains-data/condition-form-interfaces";

describe("HealthFactor Condition Factory", () => {
    it("creates an empty condition", async () => {
        const empty = HealthFactorConditionFactory.empty();

        expect(empty.enabled).to.be.false;
        expect(empty.amount.toNumber()).to.be.equal(0);
        expect(empty.comparison).to.be.equal(0);
        expect(empty.kontract).to.be.equal(ZeroAddress);
    });

    it("returns an empty condition when trying to build from undefined json", async () => {
        const condition = HealthFactorConditionFactory.fromJson();

        assert.deepEqual(condition, HealthFactorConditionFactory.empty());
    });

    it("restores condition from json object", async () => {
        const originalCondition: IHealthFactorCondition = {
            enabled: true,
            kontract: "0xea674fdde714fd979de3edf0f56aa9716b898ec8",
            comparison: ComparisonType.GreaterThan,
            amount: ethers.utils.parseEther("1.255")
        };
        const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
        const condition = HealthFactorConditionFactory.fromJson(jsonCondition);

        assert.equal(JSON.stringify(condition), JSON.stringify(originalCondition));
    });

    it("throws error if form is enabled but not valid", async () => {
        const form: IHealthFactorConditionForm = {
            type: ScriptConditions.HEALTH_FACTOR,
            valid: false,
            contractAddress: "0xea674fdde714fd979de3edf0f56aa9716b898ec8",
            comparison: ComparisonType.GreaterThan,
            floatAmount: 1.554
        };

        const gonnaThrow = () => HealthFactorConditionFactory.fromForm(form);
        expect(gonnaThrow).to.throw("Cannot build HealthFactor condition from invalid form");
    });

    describe("creates a condition from a form", () => {
        const form: IHealthFactorConditionForm = {
            type: ScriptConditions.HEALTH_FACTOR,
            valid: true,
            contractAddress: "0xea674fdde714fd979de3edf0f56aa9716b898ec8",
            comparison: ComparisonType.GreaterThan,
            floatAmount: 1.554
        };

        it("happy flow", async () => {
            const condition = HealthFactorConditionFactory.fromForm(form);

            expect(condition.enabled).to.be.true;
            expect(condition.comparison).to.be.equal(ComparisonType.GreaterThan);
            expect(condition.kontract).to.be.equal("0xea674fdde714fd979de3edf0f56aa9716b898ec8");
            expect(condition.amount.toHexString()).to.be.equal(
                ethers.utils.parseEther("1.554").toHexString()
            );
        });
    });

    describe("creates a condition from a bundle", () => {
        const form: IHealthFactorConditionForm = {
            type: ScriptConditions.HEALTH_FACTOR,
            valid: true,
            contractAddress: "0xea674fdde714fd979de3edf0f56aa9716b898ec8",
            comparison: ComparisonType.GreaterThan,
            floatAmount: 1.554
        };

        it("happy flow", async () => {
            const bundle: ICurrentScript = {
                id: "0x11111111111",
                description: "lorem ipsum",
                action: {
                    title: "FakeAction",
                    info: "Whatevs",
                    conditions: [],
                    form: { type: ScriptAction.NONE, valid: true }
                },
                conditions: {
                    "Health Factor": {
                        title: "Health Factor",
                        info: "Whatevs",
                        form
                    }
                }
            };

            const condition = HealthFactorConditionFactory.fromBundle(bundle);

            expect(condition.enabled).to.be.true;
            expect(condition.comparison).to.be.equal(ComparisonType.GreaterThan);
            expect(condition.kontract).to.be.equal('0xea674fdde714fd979de3edf0f56aa9716b898ec8');
            expect(condition.amount.toHexString()).to.be.equal(
                ethers.utils.parseEther("1.554").toHexString()
            );
        });

        it("returns an empty form if the balance condition is missing from the bundle", async () => {
            const emptyBundle: ICurrentScript = {
                id: "0x11111111111",
                description: "lorem ipsum",
                action: {
                    title: "FakeAction",
                    info: "Whatevs",
                    conditions: [],
                    form: { type: ScriptAction.NONE, valid: true }
                },
                conditions: {}
            };

            const condition = HealthFactorConditionFactory.fromBundle(emptyBundle);

            assert.deepEqual(condition, HealthFactorConditionFactory.empty());
        });
    });
});
