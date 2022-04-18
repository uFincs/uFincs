// This seed data is the encrypted version of the original seedData.ts file.
// This is now what's used as seed data for the test@test.com account.
//
// The original seedData is kept around as a mapping for all the encrypted values are,
// as well as for the frontend's e2e tests (since it uses the seed data directly for testing).

export const USERS = [
    {
        id: "3e26fac0-7786-40f3-86bb-f175ff3d721d",
        email: "test@test.com",
        password: "$2a$10$kHbhbrZkKOvKkBeXYRsVIeuTXjlGoFq.6ndjVloax/54Nx5qMYHTq", // Password = 'test'
        edek: "UC4rO6kO9hExJ0hzsviHHZ8xU7EpGCgFGyGJVh9KpDbUX1pxeX83qA==",
        kekSalt: "PovlHmkzJ14Wm11+lLl4bQ==",
        isOnboarded: true, // Make seed users onboarded by default for easier testing.
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const USER_IDS = USERS.map((user) => user.id);

export const PREFERENCES = [
    {
        userId: USER_IDS[0],
        currency: null,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const PREFERENCE_IDS = PREFERENCES.map((preference) => preference.userId);

// Static account IDs
const CHEQUING_ID = "89b52183-9064-46ea-adc5-7708512d0431";
const CASH_ID = "2707ffb9-8019-447c-8ade-3ede3b54dd83";
const SAVINGS_ID = "9056bacc-b0e5-4810-90e7-52dc15dfab5c";
const CREDIT_CARD_ID = "bd7633fc-fd35-488a-bcde-06354be7d652";
const FOOD_ID = "a0dd23c6-7b02-4b0b-8356-4d1a7395701f";
const TECH_ID = "8fb41e13-70fb-4a8e-88bf-19d19326a8bb";
const SALARY_ID = "a4bf8b8b-f368-4ed3-96ba-9ae59cf19c4f";
const INTEREST_ID = "b5136af4-5812-4915-a96b-15264bce2362";

// Static import profile IDs
const SCOTIA_BANK_CHEQUING_ID = "1857614e-ca6d-4161-8a91-93b980ef6c42";

// Account balances are stored in cents (i.e. divide by 100 to get dollars)
// Account interests are stored in millipercents (i.e. divide by 1000 to get a percentage)
export const ACCOUNTS = [
    {
        id: CHEQUING_ID,
        userId: USER_IDS[0],
        name: "w5Yh4cQTK2VMPldf:UhSXZhcVRxdbanetkyAo6GuaQ9rMRxWs",
        type: "ifGaGUSzk9ugbX7Q:69zfk3kmKR4fGnL+CEPvWbb8OQrD",
        openingBalance: "uQXmYzU/qeqReF8f:F0JBDR+HbRhzfDKFEWaxt9J9LR35Fw==",
        interest: "qghbD+/nQyRMokGu:475qFPxKoURp4Lh+CcbNyYU=",
        createdAt: "R01KEaieXU5ZFhfu:5Af6OaEVD4qwnqoytk0iPsvfSNXNKHBxuOFRBPM2U41tgJ0GgUeV2Q==",
        updatedAt: "M22uOF+8uwCmcyVL:t8BjKT7y0/pvrheh85hjn2QIxYntgMQzEqFU7Lr1HG5SlNsrYtMZrQ=="
    },
    {
        id: CASH_ID,
        userId: USER_IDS[0],
        name: "DdAw1MmLNphSeRkO:m2bc/ivKT3mXS1FpxEPQBL6Uwek=",
        type: "lPlxpnzi733sRzMK:Hpf+hip9LTyZmQj0wBwXdyMDNqTx",
        openingBalance: "4C3xkct+fz+EqHWb:QfZN7vNz0oXD9AFJLkdADKPQONwp",
        interest: "sxOiT471GxFxyhnC:2YyolAVGLwM44iR0HtGg6UU=",
        createdAt: "Feie1cjBKlV5r92k:cU3aQ3559JNZPMy5JzxcTnwj9pGXnI7kyj7yoxHnPVj+79KIADZVNA==",
        updatedAt: "JP2I1jOTFxBUI/i4:S82rx6eVk03tkUM6ybb0+QppojLGXx/scJhgJUsXZed+30RQnO8skQ=="
    },
    {
        id: SAVINGS_ID,
        userId: USER_IDS[0],
        name: "r5ld4pET2R616Yfd:8Gww7X0pGGJzVBaGUpMeRE2gsrungrozWwTLzAS1/w==",
        type: "C9vVPnaAVdJCIqU+:fyL6kZsTMZHJLwt+NKuJxAhbzXLr",
        openingBalance: "1hJWquKKHfOvPbhT:TuH4YeK6RpASl24huCfCuQ0JMbSytw==",
        interest: "+0R72EFiVIMXwrq+:j4lvmjULz1ct6WnDSgT3TYEJq64=",
        createdAt: "5RoA7Exnb8rfo8Lb:rPRNrwNxzYR+sJJTt46nkWpHqzal99LStG8Y59rb7bv611pajjtFGg==",
        updatedAt: "5uXP0umnO91uCXRj:o2rbiFEi3nFa05429N2wBylgYEzBXmfVK+80o4YXGqlCglfU+uf6Kw=="
    },
    {
        id: CREDIT_CARD_ID,
        userId: USER_IDS[0],
        name: "NWMpKguyIKBELRVH:17XbIiRacJU06kDED2uCMLhW+OUTTF8uK3U3",
        type: "fJs3NLTKp7QrW81Y:A37JsqWZxNd4OTnI9JABaFwvQ4JAWdDt5Q==",
        openingBalance: "cINpvQyRMDACkCZ2:52jL58mUN8uP1KOb6X57bB0=",
        interest: "F696Vu86FukUaCaN:dYj3RYb+yNqtWXvIkOm13oU=",
        createdAt: "XXj1EkWAhGgN/3li:lsHBE+sliaqAfYXknKcrwsVe4Oclz7BG2ozNzNqxAc0qUVDVBAIB4Q==",
        updatedAt: "LdKUnoQNa7TDKdMO:IzlmgxeKYYYIhc9y+1EeqtMEPHvqnoBHLttLoU3CojbWc9SRL1rIUA=="
    },
    {
        id: FOOD_ID,
        userId: USER_IDS[0],
        name: "nJPOmj8F7pDb1cHF:zANOmEBGnjnRSniByNCabQzuQbQ=",
        type: "WIHrgCGep8YS0ZPP:3DRsXfk1foqBlFKm25z7uMVyB6RcPmA=",
        openingBalance: "C53IVdJ2CA2I0Adr:bX6sAFO+ZXus49mqMiaU+Ng=",
        interest: "MgXy79IjxQ9ZO827:1jpAyAixjj3+k9v3eiDPbco=",
        createdAt: "kqwj4vZ1DAyt8kbr:CZ+mpsMYLCl7I6MySC28Z8NmPvVNQNMydGhWjnu8/rFVsIGOiP5J9g==",
        updatedAt: "D4gHFC1VKEnFq221:Ujy965qu2fn0eCdAkZLPal8vqOxKovPqjkzCv9B1f8fEtiKvj4Tphg=="
    },
    {
        id: TECH_ID,
        userId: USER_IDS[0],
        name: "EQuVbvNaiWZWdL3H:d5vqyVv8SneOc71tazjXx2UQdCQ=",
        type: "ekQRxfqpWt+QA5tK:uYzHsgDTdy1nZDngRvfNBtYaqdcofr0=",
        openingBalance: "MngT0XEd4+td3c1l:ehLo7om8y8FkizFxSjQ4WEU=",
        interest: "1O1I16hTu+q0e+y6:wRFEtc3jij81OdQ8U+u3RsM=",
        createdAt: "Sf5oyJ8MSwTRzHI3:vnBHn/7zGXi60LueXPSKDece5b5X2yHrpLQrp7U/FBdr2vCOTI6iYg==",
        updatedAt: "KsrqT/c98JSI4lOi:sTjVPI+BaN/iP3DFQ+m96bb7wrFvIqW5MRsAKWVgxQ+GPCmjuH9EWg=="
    },
    {
        id: SALARY_ID,
        userId: USER_IDS[0],
        name: "sxvCRQBM5eCcxgZv:powBACDDzpl2QQOMt3cO5/T9jzMhag==",
        type: "xnZeD1LU8Ja31mGf:u4Mmi2gEUyfK+hNfdtAJOM/XStlYfg==",
        openingBalance: "qKCrIrPZki9fGEsc:Ho0UeJ/+tcVR0xvpFD2+Iqw=",
        interest: "3cJSyOvqhwe+gkXi:yuhbHvJ6rOE6hnrSSivhYks=",
        createdAt: "IA5Qp2+6BCOEE/uz:Bcq6qMGCvi1t9zV/OyqQ+oN2qbIEqPCdQerIEpD5gBsHJ6ZOeYB9uA==",
        updatedAt: "JNLFTFpzdUbSa/hn:O7VtNCnSv3ZEzeVwM12tZ3CY3Dfl4FbWytIOPhbPkYiA2OyFUiJerQ=="
    },
    {
        id: INTEREST_ID,
        userId: USER_IDS[0],
        name: "EAWIbHv7KUd2r376:iGRZUBnntK4wPwShEXf0/AIhbcLeZtNB",
        type: "+XGq2B8ueoKhBGDO:ZC5iwB1cu2ySMagsOaf+Yjw9udMnAw==",
        openingBalance: "rgrPDNGWOGBOPems:Pbsulkc3lCmUzrO9u83LXMI=",
        interest: "O5LnH8upCpYBXTPm:5sWDdyYlOMPOES9O8jIgs1A=",
        createdAt: "AAReJHVjeUseAvFV:x4w63ZmgcovSj6SwVs/Hi+nG5a8S+c+v9gE2emW1rmgbz/Y0+Et/xg==",
        updatedAt: "b6JmAWKwdRyXiwFL:H0cbxm/RWChzCmRckzeh8E9jJEG8ZWgWiKeEAgraJgxLltHP0tkSJQ=="
    }
];

export const ACCOUNT_IDS = ACCOUNTS.map((account) => account.id);

// Transaction amounts are stored in cents
//
// Transaction type mappings:
//
//      income:     creditAccount = 'income',              debitAccount = 'asset'
//      expense:    creditAccount = 'expense',             debitAccount = 'asset'
//      debt:       creditAccount = 'expense',             debitAccount = 'liability',
//      transfer:   creditAccount = 'asset|liability',     debitAccount = 'asset|liability'
export const TRANSACTIONS = [
    {
        id: "557e82f4-fe27-40e7-a12f-83078a7dda0a",
        creditAccountId: CASH_ID,
        debitAccountId: FOOD_ID,
        amount: "M0Lyu/Z2DeOG8Mtr:4ExcitFV5oH/BAFbiHsBkH7xC6I=",
        date: "8uC1338zEz4Gp42p:DNuM95AVdJIV+VOOxnnNRZFuadorAsiQOMYHHZ3t9hygdZD3D8za9Q==",
        description: "1e6IOCQxA+B1SweD:ZMFksaAFmq/s/WG+mcHfN1JNxYyPOY1gN/dU/3v8d4uFXA==",
        notes: "j0iPBH4gqyybCZgz:ZRXC8E/+YhNF63GTvGQg+g==",
        type: "LSW3Q3HdPd1pTDu5:PmU0YyKHmhqfJyrNyFH4GIweYVz+DX0=",
        createdAt: "aaW/B2SpdnjGNkUN:/n42L7GFccIg8ueolIY0K7rG5NrzDKLa4Smf3ZipUGGp10sXjSh/hg==",
        updatedAt: "b0NhP4GuU4yTxZtp:WbkczFehtUYK1ODOHBGW+163ExRW+ye8tBfqLbt5RyfMNr61B7NHaA=="
    },
    {
        id: "fcd83d18-6bcc-4b27-80bc-512c54526f8d",
        creditAccountId: CHEQUING_ID,
        debitAccountId: FOOD_ID,
        amount: "96MvFC+RjbzbsASM:hxV49tL8kdXtuZaY+vfKjrkTwic=",
        date: "xeX47uFRU6tiSZU0:Scfh53LRxWRAUz1BQ4dkhewES8qJVhDtID+kiFCNI/oJIqx6Wx+mfw==",
        description:
            "LFBMUguo5Vmub13b:XK0bik4bQspBF7Vh4X67aJj2sbU9H7I1TeQZ5VLfSKj0ULO0eatxGxg2GiR9PYck",
        notes: "aue8tQkfWp5xk454:/QKp4pSJKoJvkt3KtjSk6Q==",
        type: "ZVAyPW3t58ruyxe8:RcVSriD7PHU1exN1vl/nIMKmW5iem/M=",
        createdAt: "Kj878jO/gZAricH7:XC1QTRl6XOrzOL5m9W5emSXafdIgmSx0ChMtWKf0f/wj1YBfeRz/aA==",
        updatedAt: "e6ChqyrTLNO9u86e:Id0HVdf2kAvxDsIp4v+04o8BPIgKaJB8XEQpOB6FJrqDNsd+7ogbMg=="
    },
    {
        id: "d47ee610-8852-4e46-bb81-2202cf440118",
        creditAccountId: CREDIT_CARD_ID,
        debitAccountId: TECH_ID,
        amount: "6p9IwgX/GTzgD60D:yj9GvuNL9c0Wj+oChdiL2g9TjrQw",
        date: "LX1B9ruRnfI9HMWA:Bz1BdxSIXvV4FHnHmxOFP1tNjXLu50OwSZiKQgedyLpwzcKE5DTl2Q==",
        description:
            "+7h653WZaPjBW5Lq:dtQS5pXhbBndQvMl3X6MMNrg7kzbKNX6yUd52BsJMpVhmD7NqN3ZVD6hW4lMDXQ=",
        notes: "ea0YF2CnpXYFV1An:bYzEx/J1uqpv2rtry8ARng==",
        type: "u9sd6c77Q2Qp6v+q:EQKBLf4ldxGoJLynAdtGl2rFEP0=",
        createdAt: "vkAe49qbUJm96hmz:sePbSGsVEyrEUWddiA2XJrni1KMBe3nYAtR9ukgNRihs0fH11hE0AA==",
        updatedAt: "uyUwMHz4Pj1p6LrT:LHxTp/vCLBFAkP5RotktKbK4ANFKjjzSZPJGq3/jKemH7yU+7yaN+g=="
    },
    {
        id: "892ae69d-476c-4ec7-9e2f-5197b0dc4919",
        creditAccountId: CREDIT_CARD_ID,
        debitAccountId: TECH_ID,
        amount: "xwkTyMzAyhJMJqL5:lEoYaYEv/TB+2mW3s12usAGSRqJw",
        date: "1oJ3h3gn0oydelIR:Y1vYMKu7BYjvU2Wi1+20QBcPgej+pw0roL2T4WGoDZ510iW9AAAA2w==",
        description:
            "K5tl/o4vGl0b2lkP:1hoZyhQEAUJOXjelmdMs9KshJx/ei8VGb81Xjp+SleNG+7ZesgNxC/xWQF+V4rai",
        notes: "fd2hif2r406tUkYy:HTV0vPW8eU7xNS6Ycb4FDw==",
        type: "YCutlqT02N2IoAyZ:j/w5XfGQ+PfBq+9myPCJ4f+sYjs=",
        createdAt: "+hr3ORl54b+DVwrW:n9DKPQc4lUBoJA2+bsurbjWZsC0FDDK7rQrSGd4tt0//gPfP1XZ7Ew==",
        updatedAt: "dRlOHlaAQkkqhSqo:ASnMbmWKVow2k2kEZFOUvTDT/zyYspKJjvxY2KmIZNBHS9piPZ+h5A=="
    },
    {
        id: "74db9c0b-bce5-4d87-8402-8b2b36a6b17c",
        creditAccountId: CHEQUING_ID,
        debitAccountId: TECH_ID,
        amount: "O/b8DmyRWsWzbCQx:+tsm7k4MWCunzsQCEqAXAah2CQ==",
        date: "WwfRibJSq//cO7He:/04F6rwuGef9dEskWuRYdrO6Jw2OlzL2+5KsDepjXjpSMUBvNvGp2w==",
        description:
            "eil3dZwyiVOU3/JB:Y3AVEV/A2XVp0FXXmRHkaPh3+RTNUC1F5qzlEzkteQsqEKzwQygOin1VmZDImfnw2g==",
        notes: "hJkLeko3NobY0q+s:4cpKnOst6Sj+MnWhVj7Zfg==",
        type: "dGbsRxQZcZdUIdj9:inUBlViA0TV8TGWii/TECJBoclpNkxk=",
        createdAt: "j1jEh2vM0Q4OQahQ:bFqf4sCcXazdPP1pvAWrtXiJljx30rWyMxUG+FzXCpjP0CIThJtQoQ==",
        updatedAt: "DBGW2iqUcx3F3Q+p:4iUjnypUI/99Ra0GJLWIYCOZr9dq//zdiv99+KkwWVYSdRHc/U1tAA=="
    },
    {
        id: "b061b3db-33b2-4671-b8e6-0cacb6fbe927",
        creditAccountId: SALARY_ID,
        debitAccountId: CHEQUING_ID,
        amount: "Th1jD9VhmfLSwNlX:qxo6vX6KfGDvr2mMDlQNhp0z50wN8Q==",
        date: "b4A+Tdt2JK8YYyCL:WKIs3Gz3mj8Q2fmp9coM3QpjyIFhmsgnkcy+5144MM4vC+mdeumHGQ==",
        description: "kPBB49G1pUlM+LWT:h0dZ0dGKUOOW//yvYNUlUFNSBhxzNI7cgV5vZ2NYgDjg0TA=",
        notes: "aXQMmOMK7dZB1GmP:eH+j9UqCTNGk8o+AyliSxQ==",
        type: "9/DswHZkkqCnLy3N:hAGivc6qozOyWFhOv83p9CpVuFVgRA==",
        createdAt: "+YPrcAx8nXBSGPW9:ZRGXWKlpd+2nwSZ7xJ8CupDX+4ByqnIZEQdXemwbIqoA/+weV5PHXQ==",
        updatedAt: "15qXbCOuZqN1sO5/:nAlLXMY4iBn8Otq2gdl3NCJ1kt9Zb5XCOEOVqW3drvGjYLaEnwXgGQ=="
    },
    {
        id: "d323751f-32a4-4947-bc09-8516ac6e457e",
        creditAccountId: SALARY_ID,
        debitAccountId: CHEQUING_ID,
        amount: "gjODrX+YFlqVMazo:vJv1/d2bfPGEM2PvZ1y7N3Zswz680A==",
        date: "h5iBemmNvswOI3Ro:x1BGTpOlvGQOsOPpUa+aaHDURdvHZvI6vh04bRm4QdamEHhSzWFPFg==",
        description: "BZspzWHKyz3Bb0ci:XBEsrBeGl56QST2TUi/wYG1Kbip97X8KGRUZ3ADXV+7VMPk=",
        notes: "G+/ey7eeQOAbr5EY:wGsRem9EzpztaPPNRTNzsA==",
        type: "puKmpMcPg6Gln83g:azJTGVP/Vb0WOHpi/x1DPLQEW10SFw==",
        createdAt: "OgOx2MODvLuWF7wP:t+f6F+mI3MqANsO2sL+NGGvUOx9aQOODNdJFnCpNU9HIk05Bkmm2iw==",
        updatedAt: "yu/Pu+KKfuE75CAK:eIcibiw0oTwQ+QyUE6QIWP0w5XpX1tRWHd2VuRJgTTNKNdD/VUd50g=="
    },
    {
        id: "36e7da7b-394a-4158-a356-d03b0bd5ef69",
        creditAccountId: CHEQUING_ID,
        debitAccountId: SAVINGS_ID,
        amount: "wjd+GM+NoQuGkBdd:zHyDNcaCRQQLXDraSLPGaUx9nd+Z0A==",
        date: "8ck35KqYQ89rLQJH:EqZozxi/ahFZPIRuPzTeuIHL7sSVyMASqz0LJIWkJuMnLvr4BL79Bg==",
        description:
            "oogycyW5ys+QGlZ5:icTygrP23bQTthEbpga3H3ijZDA7GSox8U+gyKaaoiqVrH1wK8zBvTVQtg==",
        notes: "g/vjvLmV1xTy54z5:K9L9tZOVJOkBIFkZaMZvPg==",
        type: "IJ/dhteZVYPe5n/g:817IxNkmfj6mnAVfMtmoG0uDjEs+TA3G",
        createdAt: "Xs4+IRYulDa8yof8:CNWizfrqnLhpj+8GjtBAPtfFoLEyUj0mmdVkN8lfSVR94rB6seU0YQ==",
        updatedAt: "2+rDpx32k25DAC6h:sjsFJGGXuCSvkCJhCwQTZO4DTnJZPzL4TvvI2rn84o0T7SfWow9y6Q=="
    },
    {
        id: "0075f012-7873-4552-9f91-1e552ab95283",
        creditAccountId: INTEREST_ID,
        debitAccountId: SAVINGS_ID,
        amount: "F98i2AzkCCrKpvIN:QqhmWGj3r1T0210ggqpIDiwjJrU=",
        date: "/hChUIFlzeQ/uLqJ:nXh15S7Yq9jEnTUp8efg0WJf+D2NNv7Xwe1IGTCPLy0sCQqEu+jp0Q==",
        description: "4LEaa8eR2SqfDDn+:9b1ChdnrmZkKHc32HgAIN59/8ET3a0qnuRFLQ/h8mZ+ukk4ipbjBIYg6",
        notes: "Ej+N667uOe2zn3jp:JXZYF93oTlkvBO6H7+/FwA==",
        type: "p4cX+zEwtLfB/AM9:0jNGDCCGWEVDiS/yX81v8osVApw7WQ==",
        createdAt: "MBt14y6l5PkuBdBm:JT5O4MubS0aROYvVkCSHWXjZUaQX2FxZqcGUWLVcqxoNCp7MFdI8sA==",
        updatedAt: "GtfjYw3qCN//REEE:h4TUUe+s/2ViCir/xDQnpoHkIZq+AUJ1MaPDdhnpMkHNmGEAuLZbYQ=="
    }
];

export const TRANSACTION_IDS = TRANSACTIONS.map((transaction) => transaction.id);

export const IMPORT_PROFILES = [
    {
        id: SCOTIA_BANK_CHEQUING_ID,
        userId: USER_IDS[0],
        name: "KbCqjZK6BREleksr:4UwheFNADHJKgVXRYA7bWR+6S265l1zq4NK2qlcppymMN8w=",
        createdAt: "hnwMh7vGqQWELVdi:wH1+zjHIJ0Yx8rirFPjdMmzi+u9bLGySO1DNX777BkQun8aucfqj8w==",
        updatedAt: "5Qkxr+54C3b+rINe:t9PrZJeKrXqBov8aSArr+vml1jMPJU27gi9seJHBi2qqktdWilvnYQ=="
    }
];

export const IMPORT_PROFILE_IDS = IMPORT_PROFILES.map((importProfile) => importProfile.id);

export const IMPORT_PROFILE_MAPPINGS = [
    {
        id: "6d39729f-9c3a-4f1e-a472-d70be02da7a0",
        importProfileId: SCOTIA_BANK_CHEQUING_ID,
        from: "3ixR82qkalwJOl5G:ZMeoX9u6PnGB9mkUXStIGZI=",
        to: "xrRzGds93TbJ5HLv:90JS1jnPQSAqe8S4yMWYi+RE79o=",
        createdAt: "tZFWTvgC54nQH1H6:kDY4xvuh7c3XkjCzci6YCp2DlC9fWmB7Gxb6V/nj8+ZcSM2br2jtiA==",
        updatedAt: "Bi4H0dv1yP6XdMJo:vP2GghP+9DWnXBKtGW+N0xlUtya7uaf9RePQehScubnECdnows128A=="
    },
    {
        id: "a2bf0dad-b5d9-433b-b97d-4b50a2f59e11",
        importProfileId: SCOTIA_BANK_CHEQUING_ID,
        from: "Uc73JxuuzLBEQJ2t:bsqAuxHcvPXFug7uLTD33W8=",
        to: "eyu6Y4RzMRxHvqhT:FECLowKTuazCuvE4dOw4UkZv5+nPAg==",
        createdAt: "iXimNQ1QOSz9Oljv:SubeVbbziw7FsydNR9buxbOrbARzJZR8KjXuSuEcw530iSU/SUHh5A==",
        updatedAt: "1rtWXumgZSNPfPCf:c1Fr27k87rHPDPIpmDb3pfdqR6Pe1Pb1J6+L0JCmn0wP0YvfCmYq1g=="
    },
    {
        id: "f30cb709-4cb5-4fb5-a4a2-9b10f80006fd",
        importProfileId: SCOTIA_BANK_CHEQUING_ID,
        from: "3h03Ra9zJz1mhjGN:+40vFkh1E4s8ZwCJikCdP5E=",
        to: "lEKoGCrhrHrWHvNA:iGsHUkKyPHNG+lcSvrg9Nw==",
        createdAt: "869PSM6UNONmBcb2:3ddMyRY2oWJDeovlgNDdz6tRUn3avY4W2v3e70zW0w5FQcR2fSy5+g==",
        updatedAt: "JK8iGs23cDorFze4:tFhBC5H6lpW/4v5UGNfi5xiSIA50Sx8/JnSPlUEmFQGMUMgpuNxRTw=="
    },
    {
        id: "95ca2024-2215-495e-a47d-7f56ee05ef6e",
        importProfileId: SCOTIA_BANK_CHEQUING_ID,
        from: "H3S+I9/zPgK8V8Jo:dJuajr2/Kudy98+c+U3OWYw=",
        to: "OZw3silc4FN2952b:kumrE6X7pfIlNaVbYYgG4+uj3sIRWb/OPxGr",
        createdAt: "AGAxMqy3oKnM757v:xfONmEOIuJGCVPxbxoKq2JjyF1eX8yy4E7rOeMn2q4d6NTRZgpRM2w==",
        updatedAt: "w36C7ccjEUhpgfJ8:mDPg3m0DaWX1mtjMqCVJFJuykPyuaaaivN4iznsxrrFlEw/AENn25Q=="
    },
    {
        id: "d0ee4eb2-d7b9-4822-acfb-89b7c9e54dff",
        importProfileId: SCOTIA_BANK_CHEQUING_ID,
        from: "MWIv7zvxlNOCCsrV:xeR/mc8VVbBKjepPOKNVHN8=",
        to: "L+GogygAYP1rUFCn:QYPWK0G/ioV8ITXcd/vxNHiK6Qtn+zlbPNQRduc=",
        createdAt: "O2pHITXuNmlDA97v:nHCRLe8Y8QM0M222Kd1RYOkugjs4o+3RKrrMOqbdnicpYKaWkerB3A==",
        updatedAt: "ierbbPt/bIW8Dldg:vaPT1kE8uET1lUM6Lo/AhM/PAcQiJnnmDe4ocgAQYAq0Lwk6T0Kkpw=="
    }
];

export const IMPORT_PROFILE_MAPPING_IDS = IMPORT_PROFILE_MAPPINGS.map(
    (importProfileMapping) => importProfileMapping.id
);

export const SUBSCRIPTIONS = [
    {
        id: "a948735a-3b61-4d7a-af26-5da195c85b5f",
        userId: USER_IDS[0],
        customerId: null,
        productId: null,
        priceId: null,
        subscriptionId: null,
        status: "active",
        periodStart: null,
        periodEnd: null,
        isLifetime: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const SUBSCRIPTION_IDS = SUBSCRIPTIONS.map((subscription) => subscription.id);
