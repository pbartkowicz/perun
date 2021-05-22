public class Foo {
    String username = '5';  // Problem
    String password;

    private String c = 'test';
    private String user = 'root'    // Problem

    void a () {
        this.password = '6';    // Problem

        System.out.println('test');
    }
}
