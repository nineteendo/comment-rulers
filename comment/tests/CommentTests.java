package comment.tests;

public class CommentTests {
    public static void main(String[] args) {}
}

class CommentTest1 {}
// A single line comment--------------------------------------------------------

class CommentTest2 {}
/* A single line block comment------------------------------------------------*/

class CommentTest3 {}
/*------------------------------------------------------------------------------
 * A multi-line block comment---------------------------------------------------
 *----------------------------------------------------------------------------*/

class CommentTest4 {}
/* A single line block comment */   // A single line comment--------------------

class CommentTest5 {}
/* A single line block comment */   /* Another single line block comment------*/

class CommentTest6 {}
/* A single line block comment */   /*------------------------------------------
                                     * A multi-line block comment---------------------------------------------------
                                     *----------------------------------------------------------------------------*/

class CommentTest7 {}
/*------------------------------------------------------------------------------
 * A multi-line block comment---------------------------------------------------
 */ // A single line comment----------------------------------------------------

class CommentTest8 {}
/*------------------------------------------------------------------------------
 * A multi-line block comment---------------------------------------------------
 */ /* A single line block comment--------------------------------------------*/

class CommentTest9 {}
/*------------------------------------------------------------------------------
 * A multi-line block comment---------------------------------------------------
 */ /*--------------------------------------------------------------------------
     * Another multi-line block comment---------------------------------------------
     *----------------------------------------------------------------------------*/