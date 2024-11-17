for class_file in *.class; do
    if javap -public $class_file | grep -q 'public static void main'; then
        class_name=$(basename $class_file .class)
        java $class_name
        exit 0
    fi
done

exit 1