const {sqlForPartialUpdate} = require('./sql');

describe("Test for sqlForPartialUpdate", () => {
    test('test for 1 item', () => {
        const result = sqlForPartialUpdate({a: "aa"}, {a: "a", b: "b"});
        expect(result).toEqual({
            setCols: "\"a\"=$1",
            values: ["aa"]
        })
    })

    test('test for 2 items', () => {
        const result = sqlForPartialUpdate({a:"aa", b:"bb"}, {a:"a"});
        expect(result).toEqual({
            setCols: "\"a\"=$1, \"b\"=$2",
            values: ["aa", "bb"]
        })
    })
})