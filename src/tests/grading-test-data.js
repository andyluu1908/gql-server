export const test_user_files =
   '{ "src": {"name": "src","isDir": true,"isTmplFile": true,"isImmutable": false,"children": {"main": {"name": "main","isDir": true,"isTmplFile": true,"isImmutable": false,"children": { "java": {"name": "java", "isDir": true,"isTmplFile": true,"isImmutable": false,"children": {"exlcode": { "name": "exlcode","isDir": true,"isTmplFile": true,"isImmutable": false, "children": { "RelationalOperatorPractiseOne_Solution.java": { "name": "RelationalOperatorPractiseOne_Solution.java","isDir": false, "isTmplFile": false, "isImmutable": false,"contents": "package exlcode;\\r\\npublic class RelationalOperatorPractiseOne_Solution{\\r\\n  public boolean exampleMethod(boolean paramOne, boolean paramTwo) {\\r\\n    // returns true when paramOne and paramTwo and equal to each other\\r\\n    // returns false if paramOne and paramTwo hold different boolean values\\r\\n    return (paramOne == paramTwo);\\r\\n  }\\r\\n}"} } } } } } } } } }';

//  '{"src":{"name":"src","isDir":true,"isTmplFile":true,"isImmutable":false,"children":{"main":{"name":"main","isDir":true,"isTmplFile":true,"isImmutable":false,"children":{"java":{"name":"java","isDir":true,"isTmplFile":true,"isImmutable":false,"children":{"exlcode":{"name":"exlcode","isDir":true,"isTmplFile":true,"isImmutable":false,"children":{"RelationalOperatorPracticeOne_Test.java":{"name":"RelationalOperatorPracticeOne_Test.java","isDir":false,"isTmplFile":false,"isImmutable":false,"contents":"package exlcode;\nimport org.junit.*;\nimport static org.junit.Assert.*;\n\npublic class RelationalOperatorPracticeOne_Test{\n    @Test\n    public void checkExampleMethod() {\n\tRelationalOperatorPracticeOne varOne = new RelationalOperatorPracticeOne();\n\tassertTrue(varOne.exampleMethod(true,true) == true);\n\tassertTrue(varOne.exampleMethod(true,false) == false);\n\tassertTrue(varOne.exampleMethod(false,true) == false);\n\tassertTrue(varOne.exampleMethod(false,false) == true);\n\t}\n}"}}}}}}}}}}';