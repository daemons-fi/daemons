import { expect } from 'chai';
import { stringifyBigNumber, truncateAndEscapeText } from '../utils';
import { utils } from 'ethers';


describe('stringifyBigNumber', () => {

    it('returns the untouched string passed as argument', async () => {
        const argument = "00001_TEST";
        expect(stringifyBigNumber(argument)).to.equal(argument);
    });

    it('returns the string representation of the BigNumber passed as argument', async () => {
        const argument = utils.parseEther("3.141592653589793238");
        const stringified = "3141592653589793238";

        expect(stringifyBigNumber(argument)).to.equal(stringified);
    });

    it('returns the string representation of the serialized BigNumber passed as argument', async () => {
        const argument = JSON.parse(JSON.stringify(utils.parseEther("3.141592653589793238")));
        // equal to { type: 'BigNumber', hex: '0x2b992ddfa23249d6' }
        const stringified = "3141592653589793238";

        expect(stringifyBigNumber(argument)).to.equal(stringified);
    });

    it('throws if the argument is unrecognized', async () => {
        const argument = 1;
        const functionThatWillThrow = () => stringifyBigNumber(argument);

        expect(functionThatWillThrow).to.throw();
    });
});


describe('truncateAndEscapeText', () => {

    it('dangerous characters are removed', async () => {
        const input = "<script> alert('##hacker##!'); </script>";
        const expectedOutput = "script alerthacker script";

        expect(truncateAndEscapeText(input)).to.equal(expectedOutput);
    });

    it('emojis are not removed', async () => {
        const input = "🐻🐻🐻";
        const expectedOutput = "🐻🐻🐻";

        expect(truncateAndEscapeText(input)).to.equal(expectedOutput);
    });

    it('text is truncated to the prefixed length', async () => {
        const input = "lorem ipsum";
        const expectedOutput = "lorem ips";

        expect(truncateAndEscapeText(input, 9)).to.equal(expectedOutput);
    });
});
