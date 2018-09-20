const Config = {
    db: {
        host: '194.182.67.206',
        port: '49172',
        name: 'Alcourses',
        user: 'test',
        password: 'test',
        magicLink: 'mssql://test:test@194.182.67.206:49172/Alcourses'
    },

    API: '/api/',
    PORT: 3000,

    proceduresLogFile: './procedures.json'
};

module.exports = Config;