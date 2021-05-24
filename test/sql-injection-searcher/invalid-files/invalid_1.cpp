int age = getAge();
SACommand select(&con, _TSA("SELECT NAME, AGE FROM EMPLOYEES WHERE AGE > " + age));

select << 30L;
select.Execute();

while(select.FetchNext()) {
    SAString sName = select[1].asString();
    long nAge = select[2].asLong();
    printf("Name: %s, age: %d \n", sName, nAge);
}
