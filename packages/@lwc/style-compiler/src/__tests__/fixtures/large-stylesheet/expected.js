function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return [".foo-0", shadowSelector, " {color: #0000;}.foo-1", shadowSelector, " {color: #0001;}.foo-2", shadowSelector, " {color: #0002;}.foo-3", shadowSelector, " {color: #0003;}.foo-4", shadowSelector, " {color: #0004;}.foo-5", shadowSelector, " {color: #0005;}.foo-6", shadowSelector, " {color: #0006;}.foo-7", shadowSelector, " {color: #0007;}.foo-8", shadowSelector, " {color: #0008;}.foo-9", shadowSelector, " {color: #0009;}.foo-10", shadowSelector, " {color: #00010;}.foo-11", shadowSelector, " {color: #00011;}.foo-12", shadowSelector, " {color: #00012;}.foo-13", shadowSelector, " {color: #00013;}.foo-14", shadowSelector, " {color: #00014;}.foo-15", shadowSelector, " {color: #00015;}.foo-16", shadowSelector, " {color: #00016;}.foo-17", shadowSelector, " {color: #00017;}.foo-18", shadowSelector, " {color: #00018;}.foo-19", shadowSelector, " {color: #00019;}.foo-20", shadowSelector, " {color: #00020;}.foo-21", shadowSelector, " {color: #00021;}.foo-22", shadowSelector, " {color: #00022;}.foo-23", shadowSelector, " {color: #00023;}.foo-24", shadowSelector, " {color: #00024;}.foo-25", shadowSelector, " {color: #00025;}.foo-26", shadowSelector, " {color: #00026;}.foo-27", shadowSelector, " {color: #00027;}.foo-28", shadowSelector, " {color: #00028;}.foo-29", shadowSelector, " {color: #00029;}.foo-30", shadowSelector, " {color: #00030;}.foo-31", shadowSelector, " {color: #00031;}.foo-32", shadowSelector, " {color: #00032;}.foo-33", shadowSelector, " {color: #00033;}.foo-34", shadowSelector, " {color: #00034;}.foo-35", shadowSelector, " {color: #00035;}.foo-36", shadowSelector, " {color: #00036;}.foo-37", shadowSelector, " {color: #00037;}.foo-38", shadowSelector, " {color: #00038;}.foo-39", shadowSelector, " {color: #00039;}.foo-40", shadowSelector, " {color: #00040;}.foo-41", shadowSelector, " {color: #00041;}.foo-42", shadowSelector, " {color: #00042;}.foo-43", shadowSelector, " {color: #00043;}.foo-44", shadowSelector, " {color: #00044;}.foo-45", shadowSelector, " {color: #00045;}.foo-46", shadowSelector, " {color: #00046;}.foo-47", shadowSelector, " {color: #00047;}.foo-48", shadowSelector, " {color: #00048;}.foo-49", shadowSelector, " {color: #00049;}.foo-50", shadowSelector, " {color: #00050;}.foo-51", shadowSelector, " {color: #00051;}.foo-52", shadowSelector, " {color: #00052;}.foo-53", shadowSelector, " {color: #00053;}.foo-54", shadowSelector, " {color: #00054;}.foo-55", shadowSelector, " {color: #00055;}.foo-56", shadowSelector, " {color: #00056;}.foo-57", shadowSelector, " {color: #00057;}.foo-58", shadowSelector, " {color: #00058;}.foo-59", shadowSelector, " {color: #00059;}.foo-60", shadowSelector, " {color: #00060;}.foo-61", shadowSelector, " {color: #00061;}.foo-62", shadowSelector, " {color: #00062;}.foo-63", shadowSelector, " {color: #00063;}.foo-64", shadowSelector, " {color: #00064;}.foo-65", shadowSelector, " {color: #00065;}.foo-66", shadowSelector, " {color: #00066;}.foo-67", shadowSelector, " {color: #00067;}.foo-68", shadowSelector, " {color: #00068;}.foo-69", shadowSelector, " {color: #00069;}.foo-70", shadowSelector, " {color: #00070;}.foo-71", shadowSelector, " {color: #00071;}.foo-72", shadowSelector, " {color: #00072;}.foo-73", shadowSelector, " {color: #00073;}.foo-74", shadowSelector, " {color: #00074;}.foo-75", shadowSelector, " {color: #00075;}.foo-76", shadowSelector, " {color: #00076;}.foo-77", shadowSelector, " {color: #00077;}.foo-78", shadowSelector, " {color: #00078;}.foo-79", shadowSelector, " {color: #00079;}.foo-80", shadowSelector, " {color: #00080;}.foo-81", shadowSelector, " {color: #00081;}.foo-82", shadowSelector, " {color: #00082;}.foo-83", shadowSelector, " {color: #00083;}.foo-84", shadowSelector, " {color: #00084;}.foo-85", shadowSelector, " {color: #00085;}.foo-86", shadowSelector, " {color: #00086;}.foo-87", shadowSelector, " {color: #00087;}.foo-88", shadowSelector, " {color: #00088;}.foo-89", shadowSelector, " {color: #00089;}.foo-90", shadowSelector, " {color: #00090;}.foo-91", shadowSelector, " {color: #00091;}.foo-92", shadowSelector, " {color: #00092;}.foo-93", shadowSelector, " {color: #00093;}.foo-94", shadowSelector, " {color: #00094;}.foo-95", shadowSelector, " {color: #00095;}.foo-96", shadowSelector, " {color: #00096;}.foo-97", shadowSelector, " {color: #00097;}.foo-98", shadowSelector, " {color: #00098;}.foo-99", shadowSelector, " {color: #00099;}.foo-100", shadowSelector, " {color: #000100;}.foo-101", shadowSelector, " {color: #000101;}.foo-102", shadowSelector, " {color: #000102;}.foo-103", shadowSelector, " {color: #000103;}.foo-104", shadowSelector, " {color: #000104;}.foo-105", shadowSelector, " {color: #000105;}.foo-106", shadowSelector, " {color: #000106;}.foo-107", shadowSelector, " {color: #000107;}.foo-108", shadowSelector, " {color: #000108;}.foo-109", shadowSelector, " {color: #000109;}.foo-110", shadowSelector, " {color: #000110;}.foo-111", shadowSelector, " {color: #000111;}.foo-112", shadowSelector, " {color: #000112;}.foo-113", shadowSelector, " {color: #000113;}.foo-114", shadowSelector, " {color: #000114;}.foo-115", shadowSelector, " {color: #000115;}.foo-116", shadowSelector, " {color: #000116;}.foo-117", shadowSelector, " {color: #000117;}.foo-118", shadowSelector, " {color: #000118;}.foo-119", shadowSelector, " {color: #000119;}.foo-120", shadowSelector, " {color: #000120;}.foo-121", shadowSelector, " {color: #000121;}.foo-122", shadowSelector, " {color: #000122;}.foo-123", shadowSelector, " {color: #000123;}.foo-124", shadowSelector, " {color: #000124;}.foo-125", shadowSelector, " {color: #000125;}.foo-126", shadowSelector, " {color: #000126;}.foo-127", shadowSelector, " {color: #000127;}.foo-128", shadowSelector, " {color: #000128;}.foo-129", shadowSelector, " {color: #000129;}.foo-130", shadowSelector, " {color: #000130;}.foo-131", shadowSelector, " {color: #000131;}.foo-132", shadowSelector, " {color: #000132;}.foo-133", shadowSelector, " {color: #000133;}.foo-134", shadowSelector, " {color: #000134;}.foo-135", shadowSelector, " {color: #000135;}.foo-136", shadowSelector, " {color: #000136;}.foo-137", shadowSelector, " {color: #000137;}.foo-138", shadowSelector, " {color: #000138;}.foo-139", shadowSelector, " {color: #000139;}.foo-140", shadowSelector, " {color: #000140;}.foo-141", shadowSelector, " {color: #000141;}.foo-142", shadowSelector, " {color: #000142;}.foo-143", shadowSelector, " {color: #000143;}.foo-144", shadowSelector, " {color: #000144;}.foo-145", shadowSelector, " {color: #000145;}.foo-146", shadowSelector, " {color: #000146;}.foo-147", shadowSelector, " {color: #000147;}.foo-148", shadowSelector, " {color: #000148;}.foo-149", shadowSelector, " {color: #000149;}.foo-150", shadowSelector, " {color: #000150;}.foo-151", shadowSelector, " {color: #000151;}.foo-152", shadowSelector, " {color: #000152;}.foo-153", shadowSelector, " {color: #000153;}.foo-154", shadowSelector, " {color: #000154;}.foo-155", shadowSelector, " {color: #000155;}.foo-156", shadowSelector, " {color: #000156;}.foo-157", shadowSelector, " {color: #000157;}.foo-158", shadowSelector, " {color: #000158;}.foo-159", shadowSelector, " {color: #000159;}.foo-160", shadowSelector, " {color: #000160;}.foo-161", shadowSelector, " {color: #000161;}.foo-162", shadowSelector, " {color: #000162;}.foo-163", shadowSelector, " {color: #000163;}.foo-164", shadowSelector, " {color: #000164;}.foo-165", shadowSelector, " {color: #000165;}.foo-166", shadowSelector, " {color: #000166;}.foo-167", shadowSelector, " {color: #000167;}.foo-168", shadowSelector, " {color: #000168;}.foo-169", shadowSelector, " {color: #000169;}.foo-170", shadowSelector, " {color: #000170;}.foo-171", shadowSelector, " {color: #000171;}.foo-172", shadowSelector, " {color: #000172;}.foo-173", shadowSelector, " {color: #000173;}.foo-174", shadowSelector, " {color: #000174;}.foo-175", shadowSelector, " {color: #000175;}.foo-176", shadowSelector, " {color: #000176;}.foo-177", shadowSelector, " {color: #000177;}.foo-178", shadowSelector, " {color: #000178;}.foo-179", shadowSelector, " {color: #000179;}.foo-180", shadowSelector, " {color: #000180;}.foo-181", shadowSelector, " {color: #000181;}.foo-182", shadowSelector, " {color: #000182;}.foo-183", shadowSelector, " {color: #000183;}.foo-184", shadowSelector, " {color: #000184;}.foo-185", shadowSelector, " {color: #000185;}.foo-186", shadowSelector, " {color: #000186;}.foo-187", shadowSelector, " {color: #000187;}.foo-188", shadowSelector, " {color: #000188;}.foo-189", shadowSelector, " {color: #000189;}.foo-190", shadowSelector, " {color: #000190;}.foo-191", shadowSelector, " {color: #000191;}.foo-192", shadowSelector, " {color: #000192;}.foo-193", shadowSelector, " {color: #000193;}.foo-194", shadowSelector, " {color: #000194;}.foo-195", shadowSelector, " {color: #000195;}.foo-196", shadowSelector, " {color: #000196;}.foo-197", shadowSelector, " {color: #000197;}.foo-198", shadowSelector, " {color: #000198;}.foo-199", shadowSelector, " {color: #000199;}"].join('');
  /*@preserve LWC compiler vX.X.X*/
}
export default [stylesheet];